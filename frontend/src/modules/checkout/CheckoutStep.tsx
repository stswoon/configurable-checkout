import { type FC, type ReactNode } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";

export enum StepMode {
    EDIT = "EDIT",
    VIEW = "VIEW",
}

export interface CheckoutFlowWizardStepProps {
    title?: string;
    children: ReactNode;
    stepMode: StepMode;
    onNext?: () => void;
    onEdit?: () => void;
}

export const CheckoutStep: FC<CheckoutFlowWizardStepProps> = ({
                                                                  title,
                                                                  children,
                                                                  stepMode,
    onNext,
    onEdit,
}) => {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
                {children}
                <div className="flex justify-end">
                    {stepMode === StepMode.EDIT && (
                        <Button type="button" onClick={onNext}>
                            Next
                        </Button>
                    )}
                    {stepMode === StepMode.VIEW && (
                        <Button type="button" variant="outline" onClick={onEdit}>
                            Edit
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
