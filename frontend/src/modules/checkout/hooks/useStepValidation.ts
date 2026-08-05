import {useEffect, useRef} from "react";
import {useCheckoutContext, type StepValidator} from "@/modules/checkout/CheckoutContext";

export function useStepValidation(stepId: string, validate: StepValidator) {
    const {registerStepValidator, unregisterStepValidator} = useCheckoutContext();
    const validateRef = useRef(validate);
    validateRef.current = validate;

    useEffect(() => {
        registerStepValidator(stepId, () => validateRef.current());
        return () => unregisterStepValidator(stepId);
    }, [stepId, registerStepValidator, unregisterStepValidator]);
}
