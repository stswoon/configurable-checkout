import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Truck } from "lucide-react";
import type { WidgetProps } from "./types";

export function DeliveryWidget({ widget, quote }: WidgetProps) {
  if (!quote) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading delivery details…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Truck />
          <CardTitle className="text-base">
            {widget.stepName ?? "Delivery"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex flex-col gap-1">
          <Label htmlFor="delivery-address">Address</Label>
          <Input
            id="delivery-address"
            type="text"
            defaultValue={quote.delivery.address}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="delivery-date">Delivery date</Label>
          <Input
            id="delivery-date"
            type="text"
            defaultValue={quote.delivery.date}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  );
}
