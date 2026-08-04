import { type FC, type ReactNode } from "react";
import {Card, CardContent} from "@/ui/card";


interface CheckoutStepProps {
    title?: string;
    children: ReactNode;
}

export const CheckoutStep: FC<CheckoutStepProps> = ({title, children}) => {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
                {children}
            </CardContent>
        </Card>
    );
};
