import {useEffect, useRef} from "react";
import {Controller, useForm} from "react-hook-form";
import {Truck} from "lucide-react";
import {cn} from "@/lib/utils";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import type {CheckoutWidgetProps} from "./types";

interface DeliveryValue {
  address: string;
  date: string;
}

const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/;

function resolveDefaults(
  value: DeliveryValue | undefined,
  quoteDelivery: DeliveryValue | undefined,
): DeliveryValue {
  return {
    address: value?.address ?? quoteDelivery?.address ?? "",
    date: value?.date ?? quoteDelivery?.date ?? "",
  };
}

export function DeliveryWidget({
  value,
  quote,
  onSubmit,
  onRegisterValidate,
}: CheckoutWidgetProps<DeliveryValue | undefined, unknown>) {
  const quoteDelivery = quote?.delivery;
  const form = useForm<DeliveryValue>({
    defaultValues: resolveDefaults(value, quoteDelivery),
  });

  const hydratedFromQuote = useRef(Boolean(value));
  useEffect(() => {
    if (hydratedFromQuote.current || !quoteDelivery) {
      return;
    }
    hydratedFromQuote.current = true;
    form.reset(resolveDefaults(undefined, quoteDelivery));
  }, [form, quoteDelivery]);

  const {errorClassName} = useCheckoutWidgetForm(
    form,
    (data) => {
      onSubmit({
        address: data.address.trim(),
        date: data.date.trim(),
      });
    },
    onRegisterValidate,
  );

  if (!quote) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading delivery details…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(errorClassName)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Truck />
          <CardTitle className="text-base">Delivery</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldGroup>
            <Controller
              name="address"
              control={form.control}
              rules={{
                required: "Address is required",
                validate: (current) =>
                  current.trim() ? true : "Address is required",
              }}
              render={({field, fieldState}) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="delivery-address">Address</FieldLabel>
                  <Input
                    {...field}
                    id="delivery-address"
                    type="text"
                    placeholder="Street, city"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name="date"
              control={form.control}
              rules={{
                required: "Delivery date is required",
                validate: (current) => {
                  const trimmed = current.trim();
                  if (!trimmed) {
                    return "Delivery date is required";
                  }
                  if (!DATE_PATTERN.test(trimmed)) {
                    return "Use format dd.mm.yyyy";
                  }
                  return true;
                },
              }}
              render={({field, fieldState}) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="delivery-date">Delivery date</FieldLabel>
                  <Input
                    {...field}
                    id="delivery-date"
                    type="text"
                    placeholder="dd.mm.yyyy"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Format: dd.mm.yyyy</FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
