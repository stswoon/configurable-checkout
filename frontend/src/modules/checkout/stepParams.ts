import type {Delivery, QuoteType} from "@shared/QuoteType";
import type {WidgetDefinition} from "@/modules/checkout/types";

interface KycStepValue {
    identification: string;
    verifiedUserId?: string;
    verifiedUserName?: string;
}

interface OrderDetailsStepValue {
    order: QuoteType["order"];
}

function isKycStepValue(value: unknown): value is KycStepValue {
    if (!value || typeof value !== "object") {
        return false;
    }
    return typeof (value as KycStepValue).identification === "string";
}

function isOrderDetailsStepValue(value: unknown): value is OrderDetailsStepValue {
    if (!value || typeof value !== "object") {
        return false;
    }
    return Array.isArray((value as OrderDetailsStepValue).order);
}

export function isDeliveryStepValue(value: unknown): value is Delivery {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return typeof candidate.address === "string" && typeof candidate.date === "string";
}

/** Map loaded quote into per-step context values. */
export function buildInitialStepParams(
    quote: QuoteType,
    widgets: WidgetDefinition[],
): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    for (const widget of widgets) {
        switch (widget.widgetType) {
            case "KycWidget":
                params[widget.stepId] = {
                    identification: quote.userInfo.documentId ?? "",
                } satisfies KycStepValue;
                break;
            case "OrderDetailsWidget":
                params[widget.stepId] = {order: quote.order} satisfies OrderDetailsStepValue;
                break;
            case "DeliveryWidget":
                params[widget.stepId] = {...quote.delivery};
                break;
            case "ConsentsWidget":
                params[widget.stepId] = {};
                break;
        }
    }

    return params;
}

/** Extract a single step value from a quote PUT/submit response. */
export function stepValueFromQuoteResponse(
    widgetType: string,
    quote: QuoteType,
): unknown {
    switch (widgetType) {
        case "KycWidget":
            return {identification: quote.userInfo.documentId ?? ""} satisfies KycStepValue;
        case "OrderDetailsWidget":
            return {order: quote.order} satisfies OrderDetailsStepValue;
        case "DeliveryWidget":
            return {...quote.delivery};
        default:
            return undefined;
    }
}

/** Merge all step params into a quote patch for final submit. */
export function buildQuotePatchFromStepParams(
    stepParams: Record<string, unknown>,
    widgets: WidgetDefinition[],
): Partial<QuoteType> {
    const patch: Partial<QuoteType> = {};

    for (const widget of widgets) {
        const value = stepParams[widget.stepId];
        if (value == null) {
            continue;
        }

        switch (widget.widgetType) {
            case "KycWidget":
                if (isKycStepValue(value) && value.identification.trim()) {
                    patch.userInfo = {
                        documentType: value.identification.includes("@") ? "email" : "phone",
                        documentId: value.identification.trim(),
                    };
                }
                break;
            case "OrderDetailsWidget":
                if (isOrderDetailsStepValue(value)) {
                    patch.order = value.order;
                }
                break;
            case "DeliveryWidget":
                if (isDeliveryStepValue(value)) {
                    patch.delivery = {
                        address: value.address.trim(),
                        date: value.date.trim(),
                    };
                }
                break;
        }
    }

    return patch;
}
