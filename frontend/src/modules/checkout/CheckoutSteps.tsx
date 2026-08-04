import {useQuote} from "@/hooks/useApi";
import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
import {useState} from "react";
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

    const {submitStep} = useCheckoutContext();

    const [editStepId, setEditStepId] = useState<string | undefined>(widgetDefinitions?.[0].stepId);
    const makeStepEdit = (stepId: string) => {
        setEditStepId(stepId);
    };

    const goNext = (stepId: string) => {
        const index = widgetDefinitions.findIndex((w) => w.stepId === stepId);
        if (index < widgetDefinitions.length - 1) {
            setEditStepId(widgetDefinitions[index + 1].stepId);
        } else {
            setEditStepId(undefined);
        }

    };

    const handleNext = async (stepId: string) => {
        const ok = await submitStep(stepId);
        if (ok) {
            goNext(stepId);
        }
    };

    return (
        <div data-test-id="CheckoutSteps">
            {widgetDefinitions.map((widgetDefinition) => (
                <CheckoutStep
                    key={widgetDefinition.stepId}
                    title={widgetDefinition.stepTitle}
                >
                    <WidgetRenderer
                        widgetDefinition={widgetDefinition}
                    />
                </CheckoutStep>
            ))}
        </div>
    );
}

