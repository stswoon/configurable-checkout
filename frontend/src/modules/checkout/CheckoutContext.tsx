import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {scrollToFirstInvalidStep} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {StepperView} from "@/modules/checkout/types";

export type StepParamsMap = Record<string, unknown>;
export type StepValidator = () => boolean | Promise<boolean>;

export interface CheckoutContextValue {
    quoteId: string;
    stepperView: StepperView;
    stepIds: string[];
    currentStepId: string | undefined;
    stepCount: number;
    currentStepIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    nextStep: () => Promise<boolean>;
    prevStep: () => void;

    stepParams: StepParamsMap;
    getStepParam: (stepId: string) => unknown;
    setStepParam: (stepId: string, value: unknown) => void;
    setStepParams: (params: StepParamsMap | ((prev: StepParamsMap) => StepParamsMap)) => void;

    registerStepValidator: (stepId: string, validator: StepValidator) => void;
    unregisterStepValidator: (stepId: string) => void;
    validateSteps: () => Promise<boolean>;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export interface CheckoutProviderProps {
    children: ReactNode;
    quoteId: string;
    initialStepParams?: StepParamsMap;
    stepperView?: StepperView;
    stepIds?: string[];
}

export function CheckoutProvider({
    children,
    quoteId,
    initialStepParams = {},
    stepperView = "landing",
    stepIds = [],
}: CheckoutProviderProps) {
    const [stepParams, setStepParamsState] = useState<StepParamsMap>(initialStepParams);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const validatorsRef = useRef<Map<string, StepValidator>>(new Map());

    const stepCount = stepIds.length;
    const currentStepId = stepIds[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex >= stepCount - 1;

    const getStepParam = useCallback(
        (stepId: string) => stepParams[stepId],
        [stepParams],
    );

    const setStepParam = useCallback((stepId: string, value: unknown) => {
        setStepParamsState((prev) => ({...prev, [stepId]: value}));
    }, []);

    const setStepParams = useCallback(
        (params: StepParamsMap | ((prev: StepParamsMap) => StepParamsMap)) => {
            setStepParamsState(params);
        },
        [],
    );

    const registerStepValidator = useCallback((stepId: string, validator: StepValidator) => {
        validatorsRef.current.set(stepId, validator);
    }, []);

    const unregisterStepValidator = useCallback((stepId: string) => {
        validatorsRef.current.delete(stepId);
    }, []);

    const validateCurrentStep = useCallback(async () => {
        if (stepperView !== "stepper") {
            return true;
        }
        const stepId = stepIds[currentStepIndex];
        const validator = stepIds.length > 0 ? validatorsRef.current.get(stepId) : undefined;
        if (!validator) {
            return true;
        }
        return validator();
    }, [currentStepIndex, stepIds, stepperView]);

    const nextStep = useCallback(async () => {
        if (stepperView !== "stepper" || isLastStep) {
            return true;
        }

        if (!(await validateCurrentStep())) {
            scrollToFirstInvalidStep();
            return false;
        }

        setCurrentStepIndex((index) => Math.min(index + 1, stepCount - 1));
        return true;
    }, [isLastStep, stepCount, stepperView, validateCurrentStep]);

    const prevStep = useCallback(() => {
        if (stepperView !== "stepper" || isFirstStep) {
            return;
        }
        setCurrentStepIndex((index) => Math.max(index - 1, 0));
    }, [isFirstStep, stepperView]);

    const validateSteps = useCallback(async () => {
        const validators = [...validatorsRef.current.values()];
        for (const validator of validators) {
            if (!(await validator())) {
                return false;
            }
        }
        return true;
    }, []);

    const value = useMemo(
        () => ({
            quoteId,
            stepperView,
            stepIds,
            currentStepId,
            stepCount,
            currentStepIndex,
            isFirstStep,
            isLastStep,
            nextStep,
            prevStep,
            stepParams,
            getStepParam,
            setStepParam,
            setStepParams,
            registerStepValidator,
            unregisterStepValidator,
            validateSteps,
        }),
        [
            quoteId,
            stepperView,
            stepIds,
            currentStepId,
            stepCount,
            currentStepIndex,
            isFirstStep,
            isLastStep,
            nextStep,
            prevStep,
            stepParams,
            getStepParam,
            setStepParam,
            setStepParams,
            registerStepValidator,
            unregisterStepValidator,
            validateSteps,
        ],
    );

    return (
        <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
    );
}

export function useCheckoutContext(): CheckoutContextValue {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error("useCheckoutContext must be used within CheckoutProvider");
    }
    return context;
}

interface CheckoutStepContextValue {
    value: unknown;
    setValue: (value: unknown) => void;
}

export function useCheckoutStepContext(stepId: string): CheckoutStepContextValue {
    const {getStepParam, setStepParam} = useCheckoutContext();
    const setValue = useCallback(
        (value: unknown) => setStepParam(stepId, value),
        [setStepParam, stepId],
    );

    return useMemo(
        () => ({
            value: getStepParam(stepId),
            setValue,
        }),
        [getStepParam, stepId, setValue],
    );
}
