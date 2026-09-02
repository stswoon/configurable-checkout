import { Card, CardContent } from "@/ui/card";

interface UnknownWidgetProps {
    widgetType: string;
}

export function UnknownWidget({widgetType}: UnknownWidgetProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-4 text-sm text-muted-foreground">
          Unknown widget type: <code>{widgetType}</code>
      </CardContent>
    </Card>
  );
}
