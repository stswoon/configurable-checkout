import {useMemo} from "react";
import {useQuote} from "@/hooks/useApi";
import {CheckoutProvider} from "@/modules/checkout/CheckoutContext";
import {CheckoutConfig} from "@/modules/checkout/types";
import {CheckoutStep} from "@/modules/checkout/CheckoutStep";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {SubmitStep} from "@/modules/checkout/SubmitStep";
import {buildInitialStepParams} from "@/modules/checkout/stepParams";

export interface CheckoutStepsProps {
    config: CheckoutConfig;
    quoteId: string;
}

export function CheckoutSteps({config, quoteId}: CheckoutStepsProps) {
    const widgetDefinitions = config.widgets;
    const {data: quote, isLoading, error} = useQuote(quoteId);

    const initialStepParams = useMemo(
        () => (quote ? buildInitialStepParams(quote, widgetDefinitions) : {}),
        [quote, widgetDefinitions],
    );

    if (isLoading) {
        return (
            <div className="mx-auto flex max-w-lg flex-col gap-3 p-6">
                <p className="text-center text-sm text-muted-foreground">Loading quote…</p>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="mx-auto flex max-w-lg flex-col gap-3 p-6">
                <p className="text-center text-sm text-destructive">Failed to load quote.</p>
            </div>
        );
    }

    return (
        <CheckoutProvider
            key={quoteId}
            quoteId={quoteId}
            initialStepParams={initialStepParams}
        >
            <div
                data-test-id="CheckoutSteps"
                className="mx-auto flex max-w-lg flex-col gap-3 p-6"
            >
                {widgetDefinitions.map((widgetDefinition) => (
                    <CheckoutStep
                        key={widgetDefinition.stepId}
                        title={widgetDefinition.stepTitle}
                    >
                        <WidgetRenderer widgetDefinition={widgetDefinition} />
                    </CheckoutStep>
                ))}
                <SubmitStep quoteId={quoteId} widgets={widgetDefinitions} />
            </div>
        </CheckoutProvider>
    );
}
