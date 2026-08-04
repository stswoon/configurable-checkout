import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {CheckoutProvider} from "@/modules/checkout/CheckoutContext";
import {useQuote} from "@/hooks/useApi";
import {CheckoutStep, StepMode} from "@/modules/checkout/CheckoutStep";
import {CheckoutConfig} from "@/modules/checkout/types";
import {useState} from "react";

interface CheckoutRendererProps {
    config: CheckoutConfig
    quoteId: string;
}

export function Checkout({config, quoteId}: CheckoutRendererProps) {
    const widgetDefinitions = config.widgets;
    const {data: quote} = useQuote(quoteId);

    const onSubmit = () => console.log("context")
    const onError = (error: unknown) => console.log(error)

    const [editStepId, setEditStepId] = useState<string | undefined>(widgetDefinitions?.[0].stepId);
    const makeStepEdit = (stepId: string) => {
        setEditStepId(stepId);
    }

    const goNext = (stepId: string) => {

        //check submit current stepId
        const index= widgetDefinitions.findIndex(w => w.stepId === stepId);
        if (index < widgetDefinitions.length - 1) {
            setEditStepId(widgetDefinitions[widgetDefinitions+1].stepId);
        } else {
            setEditStepId(undefined);
        }
    }

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
            {widgetDefinitions.map((widgetDefinition) => (
                <CheckoutStep
                    key={widgetDefinition.stepId}
                    title={widgetDefinition.stepTitle}
                    stepMode={editStepId === widgetDefinition.stepId ? StepMode.EDIT : StepMode.VIEW}
                    onEdit={() => makeStepEdit(widgetDefinition.stepId)}
                    onNext={() => goNext(widgetDefinition.stepId)}
                >
                    <WidgetRenderer
                        widgetDefinition={widgetDefinition}
                        stepMode={editStepId === widgetDefinition.stepId ? StepMode.EDIT : StepMode.VIEW}
                    />
                </CheckoutStep>
            ))}
        </CheckoutProvider>
    );
}
