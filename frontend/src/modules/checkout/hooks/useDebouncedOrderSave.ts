import {useEffect, useRef, useState} from "react";
import {recalculateProductPrice, updateQuote, type Quote} from "@/lib/api";
import type {OrderDetailsStepValue} from "@/modules/checkout/stepParamHandlers";
import {STEP_PARAM_HANDLERS} from "@/modules/checkout/stepParamHandlers";

const DEBOUNCE_MS = 400;

function orderCountsKey(order: Quote["order"]): string {
    return order.map((item) => `${item.id}:${item.count}`).join("|");
}

export function useDebouncedOrderSave(
    quoteId: string,
    initialOrder: Quote["order"],
    onSubmit: (value: OrderDetailsStepValue) => void,
) {
    const [order, setOrder] = useState(initialOrder);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const dirtyRef = useRef(false);
    const pendingRef = useRef(initialOrder);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlightRef = useRef(false);
    const queuedRef = useRef(false);

    useEffect(() => {
        if (dirtyRef.current) {
            return;
        }
        setOrder(initialOrder);
        pendingRef.current = initialOrder;
    }, [initialOrder]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const flushSave = async () => {
        if (inFlightRef.current) {
            queuedRef.current = true;
            return;
        }

        const snapshot = pendingRef.current;
        inFlightRef.current = true;
        setIsSaving(true);
        setSaveError(null);

        try {
            const updated = await updateQuote(quoteId, {order: snapshot});
            const pendingUnchanged = orderCountsKey(pendingRef.current) === orderCountsKey(snapshot);

            if (pendingUnchanged) {
                dirtyRef.current = false;
                const stepValue = STEP_PARAM_HANDLERS.OrderDetailsWidget.fromQuote(updated) as OrderDetailsStepValue;
                onSubmit(stepValue);
                setOrder(stepValue.order);
                pendingRef.current = stepValue.order;
            } else {
                queuedRef.current = true;
            }
        } catch {
            setSaveError("Failed to update quantity. Try again.");
        } finally {
            inFlightRef.current = false;
            setIsSaving(false);
            if (queuedRef.current) {
                queuedRef.current = false;
                timerRef.current = setTimeout(() => {
                    void flushSave();
                }, DEBOUNCE_MS);
            }
        }
    };

    const scheduleSave = (nextOrder: Quote["order"]) => {
        dirtyRef.current = true;
        pendingRef.current = nextOrder;
        setOrder(nextOrder);
        setSaveError(null);
        onSubmit({order: nextOrder});

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            void flushSave();
        }, DEBOUNCE_MS);
    };

    const changeCount = (productId: string, delta: number, minCount = 1) => {
        scheduleSave(
            order.map((item) => {
                if (item.id !== productId) {
                    return item;
                }
                const nextCount = Math.max(minCount, item.count + delta);
                return nextCount === item.count ? item : recalculateProductPrice(item, nextCount);
            }),
        );
    };

    return {order, changeCount, isSaving, saveError};
}
