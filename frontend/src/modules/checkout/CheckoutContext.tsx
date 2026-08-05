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
    setStepParam: (stepId: string, value: unknown) => void;
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
    const [stepParams, setStepParams] = useState<StepParamsMap>(initialStepParams);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const validatorsRef = useRef<Map<string, StepValidator>>(new Map());

    const stepCount = stepIds.length;
    const currentStepId = stepIds[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex >= stepCount - 1;
    const isStepper = stepperView === "stepper";

    const setStepParam = useCallback((stepId: string, value: unknown) => {
        setStepParams((prev) => ({...prev, [stepId]: value}));
    }, []);

    const registerStepValidator = useCallback((stepId: string, validator: StepValidator) => {
        validatorsRef.current.set(stepId, validator);
    }, []);

    const unregisterStepValidator = useCallback((stepId: string) => {
        validatorsRef.current.delete(stepId);
    }, []);

    const validateCurrentStep = useCallback(async () => {
        if (!isStepper) {
            return true;
        }
        const validator = validatorsRef.current.get(stepIds[currentStepIndex]);
        return validator ? validator() : true;
    }, [currentStepIndex, isStepper, stepIds]);

    const nextStep = useCallback(async () => {
        if (!isStepper || isLastStep) {
            return true;
        }
        if (!(await validateCurrentStep())) {
            scrollToFirstInvalidStep();
            return false;
        }
        setCurrentStepIndex((index) => Math.min(index + 1, stepCount - 1));
        return true;
    }, [isLastStep, isStepper, stepCount, validateCurrentStep]);

    const prevStep = useCallback(() => {
        if (!isStepper || isFirstStep) {
            return;
        }
        setCurrentStepIndex((index) => Math.max(index - 1, 0));
    }, [isFirstStep, isStepper]);

    const validateSteps = useCallback(async () => {
        for (const validator of validatorsRef.current.values()) {
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
            setStepParam,
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
            setStepParam,
            registerStepValidator,
            unregisterStepValidator,
            validateSteps,
        ],
    );

    return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckoutContext(): CheckoutContextValue {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error("useCheckoutContext must be used within CheckoutProvider");
    }
    return context;
}

export function useCheckoutStepContext(stepId: string) {
    const {stepParams, setStepParam} = useCheckoutContext();

    const setValue = useCallback(
        (value: unknown) => setStepParam(stepId, value),
        [setStepParam, stepId],
    );

    return {
        value: stepParams[stepId],
        setValue,
    };
}
