import {useEffect} from "react";
import type {StepValidator} from "@/modules/checkout/CheckoutContext";
import type {CheckoutWidgetProps} from "@/modules/checkout/widgets/types";

export function useRegisterCheckoutValidation(
    onRegisterValidate: CheckoutWidgetProps<unknown, unknown>["onRegisterValidate"],
    validate: StepValidator,
) {
    useEffect(() => {
        onRegisterValidate?.(validate);
    }, [onRegisterValidate, validate]);
}
