import {useCallback} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { formatCurrency, quoteOrderTotal } from "@/lib/api";
import { ShoppingCart } from "lucide-react";
import {useRegisterCheckoutValidation} from "@/modules/checkout/hooks/useRegisterCheckoutValidation";
import type { CheckoutWidgetProps } from "./types";

export function OrderDetailsWidget({quote, onRegisterValidate}: CheckoutWidgetProps<unknown, unknown>) {
  const validate = useCallback(() => true, []);
  useRegisterCheckoutValidation(onRegisterValidate, validate);
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
      <CardContent className="flex flex-col gap-3 pt-0">
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
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
