import type { IdpUser, Quote, WidgetDefinition } from "@/lib/api";

export interface WidgetProps {
  widget: WidgetDefinition;
  quote?: Quote;
  user?: IdpUser;
}

export function resolveWidgetType(widget: WidgetDefinition): string {
  return widget.widgetType ?? ""
}

export function getWidgetParams(widget: WidgetDefinition): Record<string, unknown> {
  return widget.widgetParams ?? {};
}
