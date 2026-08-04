import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { ShieldCheck } from "lucide-react";
import type { CheckoutWidgetProps } from "./types";
import { getWidgetParams } from "./types";

export function KycWidget({ widget }: CheckoutWidgetProps) {
  const params = getWidgetParams(widget);
  const identificationType = (params.identificationType as string) ?? "phone";
  const isPhone = identificationType === "phone";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck />
          <CardTitle className="text-base">
            {widget.stepName ?? "Know Your Customer"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-sm text-muted-foreground">
          Verify your identity using {isPhone ? "phone number" : "email address"}.
        </p>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`kyc-${identificationType}`} className="capitalize">
            {identificationType}
          </Label>
          <Input
            id={`kyc-${identificationType}`}
            type={isPhone ? "tel" : "email"}
            placeholder={isPhone ? "+1 555 000 0000" : "you@example.com"}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  );
}
