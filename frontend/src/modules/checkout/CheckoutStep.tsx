import { type FC, type ReactNode } from "react";

interface CheckoutStepProps {
    title?: string;
    children: ReactNode;
}

export const CheckoutStep: FC<CheckoutStepProps> = ({children}) => {
    return <>{children}</>;
};
