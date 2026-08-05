export type StepperView = "landing" | "stepper";

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