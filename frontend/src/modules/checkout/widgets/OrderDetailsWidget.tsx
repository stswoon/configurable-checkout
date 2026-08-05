import {useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {useSWRConfig} from "swr";
import {Minus, Plus, ShoppingCart} from "lucide-react";
import {
  formatCurrency,
  quoteOrderTotal,
  recalculateProductPrice,
  updateQuote,
  type Quote,
} from "@/lib/api";
import {Button} from "@/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {FieldDescription, FieldGroup, FieldSeparator} from "@/ui/field";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {CheckoutWidgetProps} from "./types";

const COUNT_DEBOUNCE_MS = 400;
const MIN_COUNT = 1;

interface OrderDetailsValue {
  confirmed: boolean;
}

function orderCountsKey(order: Quote["order"]): string {
  return order.map((item) => `${item.id}:${item.count}`).join("|");
}

export function OrderDetailsWidget({
  quote,
  onSubmit,
  onRegisterValidate,
}: CheckoutWidgetProps<OrderDetailsValue | undefined, unknown>) {
  const {mutate} = useSWRConfig();
  const form = useForm<OrderDetailsValue>({
    defaultValues: {
      confirmed: true,
    },
  });

  useCheckoutWidgetForm(form, onSubmit, onRegisterValidate, {submitOnValidate: false});

  const [order, setOrder] = useState<Quote["order"]>(() => quote?.order ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dirtyRef = useRef(false);
  const pendingOrderRef = useRef<Quote["order"]>(quote?.order ?? []);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteIdRef = useRef(quote?.id);
  const inFlightRef = useRef(false);
  const queuedFlushRef = useRef(false);

  quoteIdRef.current = quote?.id;

  useEffect(() => {
    if (!quote) {
      return;
    }
    if (!dirtyRef.current) {
      setOrder(quote.order);
      pendingOrderRef.current = quote.order;
    }
  }, [quote]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const flushSave = async () => {
    const quoteId = quoteIdRef.current;
    if (!quoteId) {
      return;
    }
    if (inFlightRef.current) {
      queuedFlushRef.current = true;
      return;
    }

    const orderToSave = pendingOrderRef.current;
    inFlightRef.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      const updated = await updateQuote(quoteId, {order: orderToSave});
      const pendingUnchanged =
        orderCountsKey(pendingOrderRef.current) === orderCountsKey(orderToSave);

      if (pendingUnchanged) {
        dirtyRef.current = false;
        setOrder(updated.order);
        pendingOrderRef.current = updated.order;
        await mutate(["quote", quoteId], updated, {revalidate: false});
      } else {
        await mutate(
          ["quote", quoteId],
          {...updated, order: pendingOrderRef.current},
          {revalidate: false},
        );
        queuedFlushRef.current = true;
      }
    } catch {
      setSaveError("Failed to update quantity. Try again.");
    } finally {
      inFlightRef.current = false;
      setIsSaving(false);
      if (queuedFlushRef.current) {
        queuedFlushRef.current = false;
        saveTimerRef.current = setTimeout(() => {
          void flushSave();
        }, COUNT_DEBOUNCE_MS);
      }
    }
  };

  const schedulePersist = (nextOrder: Quote["order"]) => {
    if (!quoteIdRef.current) {
      return;
    }

    dirtyRef.current = true;
    pendingOrderRef.current = nextOrder;
    setOrder(nextOrder);
    setSaveError(null);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void flushSave();
    }, COUNT_DEBOUNCE_MS);
  };

  const changeCount = (productId: string, delta: number) => {
    const nextOrder = order.map((item) => {
      if (item.id !== productId) {
        return item;
      }
      const nextCount = Math.max(MIN_COUNT, item.count + delta);
      if (nextCount === item.count) {
        return item;
      }
      return recalculateProductPrice(item, nextCount);
    });
    schedulePersist(nextOrder);
  };

  if (!quote) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading order details…
        </CardContent>
      </Card>
    );
  }

  const total = quoteOrderTotal({order});

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
            <ul className="flex flex-col gap-3">
              {order.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      aria-label={`Decrease ${item.name} quantity`}
                      disabled={item.count <= MIN_COUNT}
                      onClick={() => changeCount(item.id, -1)}
                    >
                      <Minus />
                    </Button>
                    <span className="tabular-nums w-6 text-center" aria-live="polite">
                      {item.count}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => changeCount(item.id, 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <span className="tabular-nums w-20 text-right">
                    {formatCurrency(item.priceInfo.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
            <FieldSeparator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
            {saveError ? (
              <p className="text-destructive text-sm">{saveError}</p>
            ) : (
              <FieldDescription>
                {isSaving
                  ? "Updating quote…"
                  : "Adjust quantities — price updates after a short pause."}
              </FieldDescription>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
