import {Quote} from "@/lib/api";

export interface CheckoutWidgetProps<T, P> {
  value: T;
  onSubmit: (value: T) => void;
  params?: P;
  quote?: Quote;
}



