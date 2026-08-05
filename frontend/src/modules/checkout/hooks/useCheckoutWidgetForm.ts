import {useCallback} from "react";
import type {FieldValues, UseFormReturn} from "react-hook-form";
import {useRegisterCheckoutValidation} from "@/modules/checkout/hooks/useRegisterCheckoutValidation";
import type {CheckoutWidgetProps} from "@/modules/checkout/widgets/types";

export function useCheckoutWidgetForm<T extends FieldValues>(
    form: UseFormReturn<T>,
    onSubmit: (value: T) => void,
    onRegisterValidate?: CheckoutWidgetProps<unknown, unknown>["onRegisterValidate"],
    options?: {submitOnValidate?: boolean},
) {
    const submitOnValidate = options?.submitOnValidate ?? true;

    const validate = useCallback(async () => {
        const valid = await form.trigger();
        if (!valid) {
            return false;
        }
        if (submitOnValidate) {
            onSubmit(form.getValues());
        }
        return true;
    }, [form, onSubmit, submitOnValidate]);

    useRegisterCheckoutValidation(onRegisterValidate, validate);
}
