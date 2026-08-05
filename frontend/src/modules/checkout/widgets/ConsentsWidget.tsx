import {Controller, useForm} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {Checkbox} from "@/ui/checkbox";
import {Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet} from "@/ui/field";
import {ClipboardCheck} from "lucide-react";
import {cn} from "@/lib/utils";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {CheckoutWidgetProps} from "./types";

const DEFAULT_CONSENTS = [
  {id: "terms", label: "I agree to the Terms of Service", required: true},
  {id: "privacy", label: "I agree to the Privacy Policy", required: true},
  {id: "marketing", label: "I agree to receive marketing communications", required: false},
] as const;

type ConsentsValue = Record<string, boolean>;

function buildDefaultValues(value?: ConsentsValue): ConsentsValue {
  return DEFAULT_CONSENTS.reduce<ConsentsValue>((acc, consent) => {
    acc[consent.id] = Boolean(value?.[consent.id]);
    return acc;
  }, {});
}

export function ConsentsWidget({
  value,
  onSubmit,
  onRegisterValidate,
}: CheckoutWidgetProps<ConsentsValue | undefined, unknown>) {
  const form = useForm<ConsentsValue>({
    defaultValues: buildDefaultValues(value),
  });

  const {errorClassName} = useCheckoutWidgetForm(form, onSubmit, onRegisterValidate);

  return (
    <Card className={cn(errorClassName)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck />
          <CardTitle className="text-base">Consents</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldSet>
            <FieldGroup data-slot="checkbox-group">
              {DEFAULT_CONSENTS.map((consent) => (
                <Controller
                  key={consent.id}
                  name={consent.id}
                  control={form.control}
                  rules={
                    consent.required
                      ? {
                          validate: (checked) =>
                            checked === true || "Please accept all required consents",
                        }
                      : undefined
                  }
                  render={({field, fieldState}) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid || undefined}
                    >
                      <Checkbox
                        id={`consent-${consent.id}`}
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={`consent-${consent.id}`} className="font-normal">
                          {consent.label}
                          {consent.required ? " *" : ""}
                        </FieldLabel>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
              ))}
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  );
}
