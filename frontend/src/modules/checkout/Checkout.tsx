import {CheckoutProvider, type StepParamsMap} from "@/modules/checkout/CheckoutContext";
import {CheckoutSteps} from "@/modules/checkout/CheckoutSteps";
import {SubmitStep} from "@/modules/checkout/SubmitStep";
import {CheckoutConfig} from "@/modules/checkout/types";

interface CheckoutRendererProps {
    config: CheckoutConfig
    quoteId: string;
}

export function Checkout({config, quoteId}: CheckoutRendererProps) {
    const widgetDefinitions = config.widgets;

    if (widgetDefinitions.length === 0) {
        return (
            <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
                <p className="text-center text-sm text-muted-foreground">
                    No widgets in configuration
                </p>
            </div>
        );
    }

    return (
        <CheckoutProvider>
            <CheckoutSteps config={config} quoteId={quoteId} />
        </CheckoutProvider>
    );
}
