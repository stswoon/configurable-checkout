import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type StepParamsMap = Record<string, unknown>;

export interface CheckoutContextValue {
    stepParams: StepParamsMap;
    getStepParam: (stepId: string) => unknown;
    setStepParam: (stepId: string, value: unknown) => void;
    getStepParams: () => StepParamsMap;
    setStepParams: (
        params: StepParamsMap | ((prev: StepParamsMap) => StepParamsMap),
    ) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export interface CheckoutProviderProps {
    children: ReactNode;
    initialStepParams?: StepParamsMap;
}

export function CheckoutProvider({children, initialStepParams = {}}: CheckoutProviderProps) {
    const [stepParams, setStepParamsState] = useState<StepParamsMap>(initialStepParams);

    const getStepParam = useCallback(
        (stepId: string) => stepParams[stepId],
        [stepParams],
    );

    const setStepParam = useCallback((stepId: string, value: unknown) => {
        setStepParamsState((prev) => ({...prev, [stepId]: value}));
    }, []);

    const getStepParams = useCallback(() => stepParams, [stepParams]);

    const setStepParams = useCallback(
        (params: StepParamsMap | ((prev: StepParamsMap) => StepParamsMap)) => {
            setStepParamsState(params);
        },
        [],
    );

    const value = useMemo(
        () => ({
            stepParams,
            getStepParam,
            setStepParam,
            getStepParams,
            setStepParams,
        }),
        [stepParams, getStepParam, setStepParam, getStepParams, setStepParams],
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
