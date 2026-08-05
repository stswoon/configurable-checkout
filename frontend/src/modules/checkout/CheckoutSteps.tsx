import {useMemo} from "react";
import {useQuote} from "@/hooks/useApi";
import {CheckoutProvider} from "@/modules/checkout/CheckoutContext";
import {CheckoutConfig, SUBMIT_STEP_ID} from "@/modules/checkout/types";
import {CheckoutStep} from "@/modules/checkout/CheckoutStep";
import {CheckoutStepper} from "@/modules/checkout/CheckoutStepper";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {SubmitStep} from "@/modules/checkout/SubmitStep";
import {buildInitialStepParams} from "@/modules/checkout/stepParams";

export interface CheckoutStepsProps {
    config: CheckoutConfig;
    quoteId: string;
}

function resolveStepperView(config: CheckoutConfig) {
    return config.stepperView === "stepper" ? "stepper" : "landing";
}

export function CheckoutSteps({config, quoteId}: CheckoutStepsProps) {
    const widgetDefinitions = config.widgets;
    const stepperView = resolveStepperView(config);
    const stepIds = useMemo(
        () =>
            stepperView === "stepper"
                ? [...widgetDefinitions.map((widget) => widget.stepId), SUBMIT_STEP_ID]
                : widgetDefinitions.map((widget) => widget.stepId),
        [stepperView, widgetDefinitions],
    );
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
            key={`${quoteId}-${stepperView}`}
            quoteId={quoteId}
            initialStepParams={initialStepParams}
            stepperView={stepperView}
            stepIds={stepIds}
        >
            <div
                data-test-id="CheckoutSteps"
                data-stepper-view={stepperView}
                className="mx-auto flex max-w-lg flex-col gap-3 p-6"
            >
                {stepperView === "stepper" ? (
                    <CheckoutStepper widgets={widgetDefinitions} quoteId={quoteId} />
                ) : (
                    <>
                        {widgetDefinitions.map((widgetDefinition) => (
                            <CheckoutStep
                                key={widgetDefinition.stepId}
                                title={widgetDefinition.stepTitle}
                            >
                                <WidgetRenderer widgetDefinition={widgetDefinition} />
                            </CheckoutStep>
                        ))}
                        <SubmitStep quoteId={quoteId} widgets={widgetDefinitions} />
                    </>
                )}
            </div>
        </CheckoutProvider>
    );
}
