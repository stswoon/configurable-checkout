import type {Delivery, QuoteType} from "@shared/QuoteType";

export interface KycStepValue {
    identification: string;
    verifiedUserId?: string;
    verifiedUserName?: string;
}

export interface OrderDetailsStepValue {
    order: QuoteType["order"];
}

function isKycStepValue(value: unknown): value is KycStepValue {
    return Boolean(value && typeof value === "object" && typeof (value as KycStepValue).identification === "string");
}

function isOrderDetailsStepValue(value: unknown): value is OrderDetailsStepValue {
    return Boolean(value && typeof value === "object" && Array.isArray((value as OrderDetailsStepValue).order));
}

export function isDeliveryStepValue(value: unknown): value is Delivery {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return typeof candidate.address === "string" && typeof candidate.date === "string";
}

interface StepParamHandler {
    fromQuote: (quote: QuoteType) => unknown;
    fromResponse: (quote: QuoteType) => unknown;
    toPatch: (value: unknown) => Partial<QuoteType>;
}

export const STEP_PARAM_HANDLERS: Record<string, StepParamHandler> = {
    KycWidget: {
        fromQuote: (quote) => ({identification: quote.userInfo.documentId ?? ""}),
        fromResponse: (quote) => ({identification: quote.userInfo.documentId ?? ""}),
        toPatch: (value) => {
            if (!isKycStepValue(value) || !value.identification.trim()) {
                return {};
            }
            return {
                userInfo: {
                    documentType: value.identification.includes("@") ? "email" : "phone",
                    documentId: value.identification.trim(),
                },
            };
        },
    },
    OrderDetailsWidget: {
        fromQuote: (quote) => ({order: quote.order}),
        fromResponse: (quote) => ({order: quote.order}),
        toPatch: (value) => (isOrderDetailsStepValue(value) ? {order: value.order} : {}),
    },
    DeliveryWidget: {
        fromQuote: (quote) => ({...quote.delivery}),
        fromResponse: (quote) => ({...quote.delivery}),
        toPatch: (value) => {
            if (!isDeliveryStepValue(value)) {
                return {};
            }
            return {
                delivery: {
                    address: value.address.trim(),
                    date: value.date.trim(),
                },
            };
        },
    },
    ConsentsWidget: {
        fromQuote: () => ({}),
        fromResponse: () => undefined,
        toPatch: () => ({}),
    },
};
