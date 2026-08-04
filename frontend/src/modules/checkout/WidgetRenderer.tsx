import {WIDGET_REGISTRY, UnknownWidget} from "./widgets";
import {useCheckoutStepContext} from "@/modules/checkout/CheckoutContext";
import {WidgetDefinition} from "@/lib/api";
import {StepMode} from "@/modules/checkout/CheckoutStep";

interface WidgetRendererProps {
  widgetDefinition: WidgetDefinition;
  stepMode: StepMode;
}

export function WidgetRenderer({widgetDefinition, stepMode}: WidgetRendererProps) {
  const {stepId, widgetType} = widgetDefinition;
  const {value, setValue} = useCheckoutStepContext(stepId);

  const Component = WIDGET_REGISTRY[widgetType];

  const handleSubmit = (value: unknown) => {
    setValue(value);
  }

  if (!Component) {
    return <UnknownWidget widgetType={widgetType}/>;
  }

  return (
      <Component
          value={value}
          onSubmit={handleSubmit}
          widgetMode={stepMode}
          widgetParams={widgetDefinition.widgetParams}
      />
  );
}
