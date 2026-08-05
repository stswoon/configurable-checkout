import {Controller, useForm} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {Field, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import {Truck} from "lucide-react";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {CheckoutWidgetProps} from "./types";

interface DeliveryValue {
  address: string;
  date: string;
}

export function DeliveryWidget({
  quote,
  onSubmit,
  onRegisterValidate,
}: CheckoutWidgetProps<DeliveryValue | undefined, unknown>) {
  const form = useForm<DeliveryValue>({
    defaultValues: {
      address: quote?.delivery.address ?? "",
      date: quote?.delivery.date ?? "",
    },
    values: quote
      ? {
          address: quote.delivery.address,
          date: quote.delivery.date,
        }
      : undefined,
  });

  useCheckoutWidgetForm(form, onSubmit, onRegisterValidate);

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
    <Card>
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
              render={({field}) => (
                <Field>
                  <FieldLabel htmlFor="delivery-address">Address</FieldLabel>
                  <Input {...field} id="delivery-address" type="text" readOnly />
                </Field>
              )}
            />
            <Controller
              name="date"
              control={form.control}
              render={({field}) => (
                <Field>
                  <FieldLabel htmlFor="delivery-date">Delivery date</FieldLabel>
                  <Input {...field} id="delivery-date" type="text" readOnly />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
