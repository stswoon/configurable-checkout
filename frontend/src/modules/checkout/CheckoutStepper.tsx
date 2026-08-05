import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
import {CheckoutStep} from "@/modules/checkout/CheckoutStep";
import {SubmitStep} from "@/modules/checkout/SubmitStep";
import type {WidgetDefinition} from "@/modules/checkout/types";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {Button} from "@/ui/button";

export interface CheckoutStepperProps {
    widgets: WidgetDefinition[];
    quoteId: string;
}

export function CheckoutStepper({widgets, quoteId}: CheckoutStepperProps) {
    const {
        currentStepIndex,
        stepCount,
        isFirstStep,
        isLastStep,
        nextStep,
        prevStep,
    } = useCheckoutContext();

    const currentWidget = widgets[currentStepIndex];
    if (!currentWidget) {
        return null;
    }

    return (
        <>
            <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {stepCount}: {currentWidget.stepTitle}
            </p>

            <CheckoutStep
                key={currentWidget.stepId}
                title={currentWidget.stepTitle}
            >
                <WidgetRenderer widgetDefinition={currentWidget} />
            </CheckoutStep>

            <div className="flex justify-between gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isFirstStep}
                    onClick={prevStep}
                >
                    Back
                </Button>
                {!isLastStep ? (
                    <Button
                        type="button"
                        onClick={() => {
                            void nextStep();
                        }}
                    >
                        Next
                    </Button>
                ) : null}
            </div>

            {isLastStep ? (
                <SubmitStep quoteId={quoteId} widgets={widgets} />
            ) : null}
        </>
    );
}
