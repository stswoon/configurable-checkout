import {useCallback} from "react";
import type {FieldValues, UseFormReturn} from "react-hook-form";
import {useRegisterCheckoutValidation} from "@/modules/checkout/hooks/useRegisterCheckoutValidation";
import type {CheckoutWidgetProps} from "@/modules/checkout/widgets/types";

/** Applied to a widget root when its form has validation errors. */
export const CHECKOUT_WIDGET_ERROR_CLASS = "checkout-widget-error";

export function scrollToFirstCheckoutWidgetError() {
    const target =
        document.querySelector<HTMLElement>(`.${CHECKOUT_WIDGET_ERROR_CLASS}`) ??
        document.querySelector<HTMLElement>("[aria-invalid='true']");
    target?.scrollIntoView({behavior: "smooth", block: "center"});
}

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

    const {errors} = form.formState;
    const hasError = Object.keys(errors).length > 0;

    return {
        hasError,
        errorClassName: hasError ? CHECKOUT_WIDGET_ERROR_CLASS : undefined,
    };
}
