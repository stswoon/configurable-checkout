import {Quote} from "@/lib/api";
import type {StepValidator} from "@/modules/checkout/CheckoutContext";

export interface CheckoutWidgetProps<T, P> {
  value: T;
  onSubmit: (value: T) => void;
  params?: P;
  quote?: Quote;
  onRegisterValidate?: (validate: StepValidator) => void;
}



