import {useCallback, useEffect, useRef} from "react";
import type {FieldValues, UseFormReturn} from "react-hook-form";
import {useCheckoutContext, type StepValidator} from "@/modules/checkout/CheckoutContext";

/** Applied to a widget root when its form has validation errors. */
export const CHECKOUT_WIDGET_ERROR_CLASS = "checkout-widget-error";

export function scrollToFirstCheckoutWidgetError() {
    const target =
        document.querySelector<HTMLElement>(`.${CHECKOUT_WIDGET_ERROR_CLASS}`) ??
        document.querySelector<HTMLElement>("[aria-invalid='true']");
    target?.scrollIntoView({behavior: "smooth", block: "center"});
}

/** Wait for RHF error class / aria-invalid to commit before scrolling. */
export function scrollToFirstInvalidStep() {
    requestAnimationFrame(() => {
        requestAnimationFrame(scrollToFirstCheckoutWidgetError);
    });
}

function useStepValidation(stepId: string, validate: StepValidator) {
    const {registerStepValidator, unregisterStepValidator} = useCheckoutContext();
    const validateRef = useRef(validate);
    validateRef.current = validate;

    useEffect(() => {
        registerStepValidator(stepId, () => validateRef.current());
        return () => unregisterStepValidator(stepId);
    }, [stepId, registerStepValidator, unregisterStepValidator]);
}

export function useCheckoutWidgetForm<T extends FieldValues>(
    stepId: string,
    form: UseFormReturn<T>,
    onSubmit: (value: T) => void,
    options?: {submitOnValidate?: boolean},
) {
    const submitOnValidate = options?.submitOnValidate ?? true;
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    const validate = useCallback(async () => {
        const valid = await form.trigger();
        if (!valid) {
            return false;
        }
        if (submitOnValidate) {
            onSubmitRef.current(form.getValues());
        }
        return true;
    }, [form, submitOnValidate]);

    useStepValidation(stepId, validate);

    const hasError = Object.keys(form.formState.errors).length > 0;

    return {
        hasError,
        errorClassName: hasError ? CHECKOUT_WIDGET_ERROR_CLASS : undefined,
    };
}
