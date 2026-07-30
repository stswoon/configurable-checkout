import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { CreditCard } from "lucide-react";
import type { WidgetProps } from "./types";
import { getWidgetParams } from "./types";

export function PaymentWidget({ widget }: WidgetProps) {
  const params = getWidgetParams(widget);
  const methods = (params.methods as string[]) ?? ["card"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CreditCard />
          <CardTitle className="text-base">
            {widget.stepName ?? "Payment"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        {methods.map((method) => (
          <Badge key={method} variant="outline" className="capitalize">
            {method.replace("_", " ")}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
