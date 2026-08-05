import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
import {SubmitStep} from "@/modules/checkout/SubmitStep";
import {SUBMIT_STEP_ID, SUBMIT_STEP_TITLE} from "@/modules/checkout/types";
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
        currentStepId,
        stepCount,
        isFirstStep,
        isLastStep,
        nextStep,
        prevStep,
    } = useCheckoutContext();

    const isSubmitStep = currentStepId === SUBMIT_STEP_ID;
    const currentWidget = isSubmitStep ? null : widgets[currentStepIndex];
    const stepTitle = isSubmitStep
        ? SUBMIT_STEP_TITLE
        : currentWidget?.stepTitle ?? "";

    return (
        <>
            <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {stepCount}: {stepTitle}
            </p>

            {isSubmitStep ? (
                <SubmitStep quoteId={quoteId} widgets={widgets} />
            ) : currentWidget ? (
                <WidgetRenderer key={currentWidget.stepId} widgetDefinition={currentWidget} />
            ) : null}

            {!isLastStep ? (
                <div className="flex justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isFirstStep}
                        onClick={prevStep}
                    >
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            void nextStep();
                        }}
                    >
                        Next
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    disabled={isFirstStep}
                    onClick={prevStep}
                >
                    Back
                </Button>
            )}
        </>
    );
}
