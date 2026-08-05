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