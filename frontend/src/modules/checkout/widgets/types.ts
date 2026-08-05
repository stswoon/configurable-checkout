import type {StepValidator} from "@/modules/checkout/CheckoutContext";

export interface CheckoutWidgetProps<T, P> {
  value: T;
  onSubmit: (value: T) => void;
  params?: P;
  quoteId: string;
  onRegisterValidate?: (validate: StepValidator) => void;
}



