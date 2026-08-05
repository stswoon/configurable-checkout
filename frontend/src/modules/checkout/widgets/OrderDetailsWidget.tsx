import {useForm} from "react-hook-form";
import {Minus, Plus, ShoppingCart} from "lucide-react";
import {formatCurrency, quoteOrderTotal} from "@/lib/api";
import {useDebouncedOrderSave} from "@/modules/checkout/hooks/useDebouncedOrderSave";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {OrderDetailsStepValue} from "@/modules/checkout/stepParamHandlers";
import {CheckoutWidgetCard, WidgetForm} from "@/modules/checkout/widgets/CheckoutWidgetCard";
import {Button} from "@/ui/button";
import {FieldDescription, FieldGroup, FieldSeparator} from "@/ui/field";
import type {CheckoutWidgetProps} from "./types";

const MIN_COUNT = 1;

export function OrderDetailsWidget({
    stepId,
    value,
    quoteId,
    onSubmit,
}: CheckoutWidgetProps<OrderDetailsStepValue | undefined, unknown>) {
    const form = useForm({defaultValues: {confirmed: true}});
    useCheckoutWidgetForm(stepId, form, () => undefined, {submitOnValidate: false});

    const {order, changeCount, isSaving, saveError} = useDebouncedOrderSave(
        quoteId,
        value?.order ?? [],
        onSubmit,
    );

    const total = quoteOrderTotal({order});

    return (
        <CheckoutWidgetCard icon={ShoppingCart} title="Order Details">
            <WidgetForm>
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
                                        onClick={() => changeCount(item.id, -1, MIN_COUNT)}
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
                                        onClick={() => changeCount(item.id, 1, MIN_COUNT)}
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
            </WidgetForm>
        </CheckoutWidgetCard>
    );
}
