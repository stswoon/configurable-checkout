import {UnknownWidget} from "./widgets/UnknownWidget";
import {WIDGET_REGISTRY} from "./registry";
import {useCheckoutContext, useCheckoutStepContext} from "@/modules/checkout/CheckoutContext";
import type {WidgetDefinition} from "@/modules/checkout/types";

interface WidgetRendererProps {
    widgetDefinition: WidgetDefinition;
}

export function WidgetRenderer({widgetDefinition}: WidgetRendererProps) {
    const {stepId, widgetType} = widgetDefinition;
    const {value, setValue} = useCheckoutStepContext(stepId);
    const {quoteId} = useCheckoutContext();

    const Component = WIDGET_REGISTRY[widgetType];

    if (!Component) {
        return <UnknownWidget widgetType={widgetType}/>;
    }

    return (
        <Component
            stepId={stepId}
            value={value}
            onSubmit={setValue}
            params={widgetDefinition.widgetParams}
            quoteId={quoteId}
        />
    );
}
