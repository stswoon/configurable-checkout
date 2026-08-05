import {CheckoutSteps} from "@/modules/checkout/CheckoutSteps";
import {CheckoutConfig} from "@/modules/checkout/types";

interface CheckoutRendererProps {
    config: CheckoutConfig;
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

    return <CheckoutSteps config={config} quoteId={quoteId} />;
}
