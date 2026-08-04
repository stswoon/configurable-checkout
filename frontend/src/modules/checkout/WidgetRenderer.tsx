import {UnknownWidget} from "./widgets/UnknownWidget";
import {WIDGET_REGISTRY} from "./registry";
import {useCheckoutStepContext} from "@/modules/checkout/CheckoutContext";
import {Quote, WidgetDefinition} from "@/lib/api";

interface WidgetRendererProps {
  widgetDefinition: WidgetDefinition;
  quote?: Quote;
}

export function WidgetRenderer({widgetDefinition, quote}: WidgetRendererProps) {
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
          widgetParams={widgetDefinition.widgetParams}
          quote={quote}
      />
  );
}
