import {StepMode} from "@/modules/checkout/CheckoutStep";

export interface CheckoutWidgetProps<T, P> {
  value: T;
  onSubmit: (value: T) => void;
  widgetMode: StepMode;
  params?: P;
}



