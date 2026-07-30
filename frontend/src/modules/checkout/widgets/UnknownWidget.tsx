import { Card, CardContent } from "@/ui/card";
import type { WidgetProps } from "./types";
import { resolveWidgetType } from "./types";

export function UnknownWidget({ widget }: WidgetProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-4 text-sm text-muted-foreground">
        Unknown widget type: <code>{resolveWidgetType(widget)}</code>
      </CardContent>
    </Card>
  );
}
