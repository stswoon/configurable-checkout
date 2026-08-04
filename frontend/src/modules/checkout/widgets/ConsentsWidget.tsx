import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { ClipboardCheck } from "lucide-react";
import type { CheckoutWidgetProps } from "./types";
import { getWidgetParams } from "./types";

const DEFAULT_CONSENTS = [
  { id: "terms", label: "I agree to the Terms of Service" },
  { id: "privacy", label: "I agree to the Privacy Policy" },
  { id: "marketing", label: "I agree to receive marketing communications" },
];

export function ConsentsWidget({ widget }: CheckoutWidgetProps) {
  const params = getWidgetParams(widget);
  const consents =
    (params.consents as { id: string; label: string }[] | undefined) ??
    DEFAULT_CONSENTS;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck />
          <CardTitle className="text-base">
            {widget.stepName ?? "Consents"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {consents.map((consent) => (
          <div key={consent.id} className="flex items-start gap-2">
            <input
              id={`consent-${consent.id}`}
              type="checkbox"
              className="mt-0.5 size-4 rounded border border-input"
              readOnly
            />
            <Label htmlFor={`consent-${consent.id}`} className="font-normal leading-snug">
              {consent.label}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
