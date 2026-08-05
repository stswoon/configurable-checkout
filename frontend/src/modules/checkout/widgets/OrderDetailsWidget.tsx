import {useForm} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {FieldDescription, FieldGroup, FieldSeparator} from "@/ui/field";
import {formatCurrency, quoteOrderTotal} from "@/lib/api";
import {ShoppingCart} from "lucide-react";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {CheckoutWidgetProps} from "./types";

interface OrderDetailsValue {
  confirmed: boolean;
}

export function OrderDetailsWidget({
  quote,
  onSubmit,
  onRegisterValidate,
}: CheckoutWidgetProps<OrderDetailsValue | undefined, unknown>) {
  const form = useForm<OrderDetailsValue>({
    defaultValues: {
      confirmed: true,
    },
  });

  useCheckoutWidgetForm(form, onSubmit, onRegisterValidate, {submitOnValidate: false});

  if (!quote) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading order details…
        </CardContent>
      </Card>
    );
  }

  const total = quoteOrderTotal(quote);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart />
          <CardTitle className="text-base">Order Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldGroup>
            <ul className="flex flex-col gap-2">
              {quote.order.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.count}
                  </span>
                  <span>{formatCurrency(item.priceInfo.totalPrice)}</span>
                </li>
              ))}
            </ul>
            <FieldSeparator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <FieldDescription>Review your order before continuing.</FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
