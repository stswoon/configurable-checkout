import {useCallback, useEffect, useRef} from "react";
import {UnknownWidget} from "./widgets/UnknownWidget";
import {WIDGET_REGISTRY} from "./registry";
import {useCheckoutContext, useCheckoutStepContext} from "@/modules/checkout/CheckoutContext";
import type {StepValidator} from "@/modules/checkout/CheckoutContext";
import {Quote, WidgetDefinition} from "@/lib/api";

interface WidgetRendererProps {
  widgetDefinition: WidgetDefinition;
  quote?: Quote;
}

export function WidgetRenderer({widgetDefinition, quote}: WidgetRendererProps) {
  const {stepId, widgetType} = widgetDefinition;
  const {value, setValue} = useCheckoutStepContext(stepId);
  const {registerStepValidator, unregisterStepValidator} = useCheckoutContext();
  const validateRef = useRef<StepValidator>(() => true);

  const handleSubmit = (value: unknown) => {
    setValue(value);
  };

  const handleRegisterValidate = useCallback((validate: StepValidator) => {
    validateRef.current = validate;
  }, []);

  useEffect(() => {
    registerStepValidator(stepId, () => validateRef.current());
    return () => unregisterStepValidator(stepId);
  }, [stepId, registerStepValidator, unregisterStepValidator]);

  const Component = WIDGET_REGISTRY[widgetType];

  if (!Component) {
    return <UnknownWidget widgetType={widgetType}/>;
  }

  return (
      <Component
          value={value}
          onSubmit={handleSubmit}
          params={widgetDefinition.widgetParams}
          quote={quote}
          onRegisterValidate={handleRegisterValidate}
      />
  );
}
