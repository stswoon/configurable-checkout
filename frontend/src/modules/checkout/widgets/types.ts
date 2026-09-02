export interface CheckoutWidgetProps<T, P> {
    stepId: string;
    value: T;
    onSubmit: (value: T) => void;
    params?: P;
    quoteId: string;
}
