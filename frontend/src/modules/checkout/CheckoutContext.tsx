import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

export type StepParamsMap = Record<string, unknown>;
export type StepValidator = () => boolean;

export interface CheckoutContextValue {
    stepParams: StepParamsMap;
    getStepParam: (stepId: string) => unknown;
    setStepParam: (stepId: string, value: unknown) => void;
    setStepParams: (params: StepParamsMap | ((prev: StepParamsMap) => StepParamsMap)) => void;

    registerStepValidator: (stepId: string, validator: StepValidator) => void;
    unregisterStepValidator: (stepId: string) => void;
    validateSteps: () => boolean;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export interface CheckoutProviderProps {
    children: ReactNode;
    initialStepParams?: StepParamsMap;
}

export function CheckoutProvider({children, initialStepParams = {}}: CheckoutProviderProps) {
    const [stepParams, setStepParamsState] = useState<StepParamsMap>(initialStepParams);
    const validatorsRef = useRef<Map<string, StepValidator>>(new Map());

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

    const validateSteps = useCallback(() => {
        const validArray = [];
        for (const validator of validatorsRef.current.values()) {
            validArray.push(validator());
        }
        return !validArray.includes(false);
    }, []);

    const value = useMemo(
        () => ({
            stepParams,
            getStepParam,
            setStepParam,
            setStepParams,
            registerStepValidator,
            unregisterStepValidator,
            validateSteps,
        }),
        [
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
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error("useCheckoutContext must be used within CheckoutProvider");
    }
    return {
        value: context.getStepParam(stepId),
        setValue: (value: unknown) => {
            context.setStepParam(stepId, value)
        }
    };
}
