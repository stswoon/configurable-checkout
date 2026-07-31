import {FC} from "react";
import {useForm, useFormContext} from "react-hook-form";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";

export enum StepMode {
    EDIT = 'EDIT',
    VIEW = 'VIEW',
}

export interface CheckoutFlowWizardStepProps {
    title: string;
    widgetId: string;
    stepMode: StepMode;
    onNext?: () => void;
    onBack?: () => void;
    onEdit?: () => void;
}

const CheckoutFlowWizardStep: FC<CheckoutFlowWizardStepProps> = (props) => {
    const { register } = useFormContext()

    return (
        <div>
            <WidgetRenderer
                key={widget.stepId}
                widget={widget}
                quote={quote}
            />
        </div>
    );
};
