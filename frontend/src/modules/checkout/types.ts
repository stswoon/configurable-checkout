export type StepperView = "landing" | "stepper";

export const SUBMIT_STEP_ID = "__submit__";
export const SUBMIT_STEP_TITLE = "Submit";

export interface CheckoutConfig {
    stepperView?: StepperView;
    widgets: WidgetDefinition[];
}

export interface WidgetDefinition {
    stepId: string;
    stepTitle: string;
    widgetType: string;
    widgetParams?: Record<string, unknown>;
}

export function parseCheckoutConfig(raw: unknown): CheckoutConfig | null {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return null;
    }
    const candidate = raw as Record<string, unknown>;
    if (!Array.isArray(candidate.widgets)) {
        return null;
    }
    return raw as CheckoutConfig;
}
