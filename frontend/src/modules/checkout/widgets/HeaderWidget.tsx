import type { WidgetProps } from "./types";
import { getWidgetParams } from "./types";

export function HeaderWidget({ widget }: WidgetProps) {
  const params = getWidgetParams(widget);
  const title = (params.title as string) ?? widget.stepName ?? "Checkout";
  const subtitle = params.subtitle as string | undefined;

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
