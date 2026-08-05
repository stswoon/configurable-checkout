import {useMemo, type ReactNode} from "react";
import {useQuote} from "@/hooks/useApi";
import {CheckoutProvider} from "@/modules/checkout/CheckoutContext";
import {CheckoutStepper} from "@/modules/checkout/CheckoutStepper";
import {buildInitialStepParams} from "@/modules/checkout/stepParams";
import {SUBMIT_STEP_ID, type CheckoutConfig} from "@/modules/checkout/types";
import {SubmitStep} from "@/modules/checkout/SubmitStep";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import type {QuoteType} from "@shared/QuoteType";

export interface CheckoutStepsProps {
    config: CheckoutConfig;
    quoteId: string;
}

function CheckoutShell({children}: {children: ReactNode}) {
    return (
        <div
            data-test-id="CheckoutSteps"
            className="mx-auto flex max-w-lg flex-col gap-3 p-6"
        >
            {children}
        </div>
    );
}

function CheckoutMessage({children, error}: {children: ReactNode; error?: boolean}) {
    return (
        <CheckoutShell>
            <p className={`text-center text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
                {children}
            </p>
        </CheckoutShell>
    );
}

function CheckoutContent({
    quote,
    config,
    quoteId,
}: {
    quote: QuoteType;
    config: CheckoutConfig;
    quoteId: string;
}) {
    const widgets = config.widgets;
    const stepperView = config.stepperView === "stepper" ? "stepper" : "landing";
    const isStepper = stepperView === "stepper";

    const stepIds = useMemo(
        () =>
            isStepper
                ? [...widgets.map((widget) => widget.stepId), SUBMIT_STEP_ID]
                : widgets.map((widget) => widget.stepId),
        [isStepper, widgets],
    );

    const initialStepParams = useMemo(
        () => buildInitialStepParams(quote, widgets),
        [quote, widgets],
    );

    return (
        <CheckoutProvider
            key={`${quoteId}-${stepperView}`}
            quoteId={quoteId}
            initialStepParams={initialStepParams}
            stepperView={stepperView}
            stepIds={stepIds}
        >
            <CheckoutShell>
                {isStepper ? (
                    <CheckoutStepper widgets={widgets} quoteId={quoteId} />
                ) : (
                    <>
                        {widgets.map((widget) => (
                            <WidgetRenderer key={widget.stepId} widgetDefinition={widget} />
                        ))}
                        <SubmitStep quoteId={quoteId} widgets={widgets} />
                    </>
                )}
            </CheckoutShell>
        </CheckoutProvider>
    );
}

export function CheckoutSteps({config, quoteId}: CheckoutStepsProps) {
    const {data: quote, isLoading, error} = useQuote(quoteId);

    if (isLoading) {
        return <CheckoutMessage>Loading quote…</CheckoutMessage>;
    }

    if (error || !quote) {
        return <CheckoutMessage error>Failed to load quote.</CheckoutMessage>;
    }

    return <CheckoutContent quote={quote} config={config} quoteId={quoteId} />;
}
