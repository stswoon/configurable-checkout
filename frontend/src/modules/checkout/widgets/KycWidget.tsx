import {Controller, useForm} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import {ShieldCheck} from "lucide-react";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {CheckoutWidgetProps} from "./types";

interface KycValue {
  identification: string;
}

export function KycWidget({
  value,
  onSubmit,
  params,
  onRegisterValidate,
}: CheckoutWidgetProps<KycValue | undefined, {identificationType?: string}>) {
  const identificationType = params?.identificationType ?? "phone";
  const isPhone = identificationType === "phone";

  const form = useForm<KycValue>({
    defaultValues: {
      identification: value?.identification ?? "",
    },
  });

  useCheckoutWidgetForm(
    form,
    (data) => onSubmit({identification: data.identification.trim()}),
    onRegisterValidate,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck />
          <CardTitle className="text-base">Know Your Customer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldGroup>
            <FieldDescription>
              Verify your identity using {isPhone ? "phone number (+7 123 456 78 90)" : "email address (e.g. alice@example.com)"}.
            </FieldDescription>
            <Controller
              name="identification"
              control={form.control}
              rules={{
                required: `${identificationType} is required`,
                validate: (current) =>
                  current.trim().length > 0 || `${identificationType} is required`,
              }}
              render={({field, fieldState}) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`kyc-${identificationType}`} className="capitalize">
                    {identificationType}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`kyc-${identificationType}`}
                    type={isPhone ? "tel" : "email"}
                    placeholder={isPhone ? "+1 555 000 0000" : "you@example.com"}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
