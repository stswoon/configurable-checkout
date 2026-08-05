import {useQuote} from "@/hooks/useApi";
import {CheckoutConfig} from "@/modules/checkout/types";
import {CheckoutStep} from "@/modules/checkout/CheckoutStep";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {SubmitStep} from "@/modules/checkout/SubmitStep";

export interface CheckoutStepsProps {
    config: CheckoutConfig
    quoteId: string;
}


export function CheckoutSteps({config, quoteId}: CheckoutStepsProps) {
    const widgetDefinitions = config.widgets;
    const {data: quote} = useQuote(quoteId);

    return (
        <div
            data-test-id="CheckoutSteps"
            className="mx-auto flex max-w-lg flex-col gap-3 p-6"
        >
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
            <SubmitStep quoteId={quoteId} />
        </div>
    );
}

