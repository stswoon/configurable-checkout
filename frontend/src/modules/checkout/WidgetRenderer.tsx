import { WIDGET_REGISTRY, UnknownWidget, resolveWidgetType, type WidgetProps } from "./widgets";

export function WidgetRenderer({ widget, quote, user }: WidgetProps) {
  const widgetType = resolveWidgetType(widget);
  const Component = WIDGET_REGISTRY[widgetType] ?? UnknownWidget;
  return <Component widget={widget} quote={quote} user={user} />;
}
