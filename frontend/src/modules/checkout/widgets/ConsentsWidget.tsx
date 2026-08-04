import {useCallback, useState} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { ClipboardCheck } from "lucide-react";
import {useRegisterCheckoutValidation} from "@/modules/checkout/hooks/useRegisterCheckoutValidation";
import type { CheckoutWidgetProps } from "./types";

const DEFAULT_CONSENTS = [
  { id: "terms", label: "I agree to the Terms of Service", required: true },
  { id: "privacy", label: "I agree to the Privacy Policy", required: true },
  { id: "marketing", label: "I agree to receive marketing communications", required: false },
];

type ConsentsValue = Record<string, boolean>;

export function ConsentsWidget({value, onSubmit, onRegisterValidate}: CheckoutWidgetProps<ConsentsValue | undefined, unknown>) {
  const [checked, setChecked] = useState<ConsentsValue>(value ?? {});
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    const missingRequired = DEFAULT_CONSENTS
        .filter((consent) => consent.required)
        .filter((consent) => !checked[consent.id]);

    if (missingRequired.length > 0) {
      setError("Please accept all required consents");
      return false;
    }

    setError(null);
    onSubmit(checked);
    return true;
  }, [checked, onSubmit]);

  useRegisterCheckoutValidation(onRegisterValidate, validate);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck />
            <CardTitle className="text-base">Consents</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {DEFAULT_CONSENTS.map((consent) => (
          <div key={consent.id} className="flex items-start gap-2">
            <input
              id={`consent-${consent.id}`}
              type="checkbox"
              className="mt-0.5 size-4 rounded border border-input"
              checked={Boolean(checked[consent.id])}
              onChange={(event) => {
                setChecked((prev) => ({...prev, [consent.id]: event.target.checked}));
                if (error) {
                  setError(null);
                }
              }}
            />
            <Label htmlFor={`consent-${consent.id}`} className="font-normal leading-snug">
              {consent.label}
              {consent.required ? " *" : ""}
            </Label>
          </div>
        ))}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
