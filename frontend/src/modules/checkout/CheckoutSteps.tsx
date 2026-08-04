import {useQuote} from "@/hooks/useApi";
import {CheckoutConfig} from "@/modules/checkout/types";
import {CheckoutStep} from "@/modules/checkout/CheckoutStep";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";

export interface CheckoutStepsProps {
    config: CheckoutConfig
    quoteId: string;
}


export function CheckoutSteps({config, quoteId}: CheckoutStepsProps) {
    const widgetDefinitions = config.widgets;
    const {data: quote} = useQuote(quoteId);

    return (
        <div data-test-id="CheckoutSteps">
            {widgetDefinitions.map((widgetDefinition) => (
                <CheckoutStep
                    key={widgetDefinition.stepId}
                    title={widgetDefinition.stepTitle}
                >
                    <WidgetRenderer
                        widgetDefinition={widgetDefinition}
                        quote={quote}
                    />
                </CheckoutStep>
            ))}
        </div>
    );
}

