export interface CheckoutConfig {
    view: "steps" | "landing";
    widgets: WidgetDefinition[];
}

export interface WidgetDefinition {
    stepId: string;
    stepTitle: string;
    widgetType: string;
    widgetParams?: Record<string, unknown>;
}