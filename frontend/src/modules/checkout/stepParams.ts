import type {QuoteType} from "@shared/QuoteType";
import {STEP_PARAM_HANDLERS} from "@/modules/checkout/stepParamHandlers";
import type {WidgetDefinition} from "@/modules/checkout/types";

export {isDeliveryStepValue} from "@/modules/checkout/stepParamHandlers";

export function buildInitialStepParams(
    quote: QuoteType,
    widgets: WidgetDefinition[],
): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    for (const widget of widgets) {
        const handler = STEP_PARAM_HANDLERS[widget.widgetType];
        if (handler) {
            params[widget.stepId] = handler.fromQuote(quote);
        }
    }
    return params;
}

export function stepValueFromQuoteResponse(widgetType: string, quote: QuoteType): unknown {
    return STEP_PARAM_HANDLERS[widgetType]?.fromResponse(quote);
}

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
        const handler = STEP_PARAM_HANDLERS[widget.widgetType];
        if (handler) {
            Object.assign(patch, handler.toPatch(value));
        }
    }
    return patch;
}
