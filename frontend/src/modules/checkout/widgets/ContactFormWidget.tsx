import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Mail } from "lucide-react";
import type { WidgetProps } from "./types";
import { getWidgetParams } from "./types";

export function ContactFormWidget({ widget }: WidgetProps) {
  const params = getWidgetParams(widget);
  const fields = (params.fields as string[]) ?? ["email"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Mail />
          <CardTitle className="text-base">
            {widget.stepName ?? "Contact details"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {fields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-sm font-medium capitalize">{field}</label>
            <input
              type={field === "email" ? "email" : "text"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              placeholder={`Enter ${field}`}
              readOnly
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
