import {useCallback, useState} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { ShieldCheck } from "lucide-react";
import {useRegisterCheckoutValidation} from "@/modules/checkout/hooks/useRegisterCheckoutValidation";
import type { CheckoutWidgetProps } from "./types";

interface KycValue {
  identification: string;
}

export function KycWidget({value, onSubmit, params, onRegisterValidate}: CheckoutWidgetProps<KycValue | undefined, { identificationType?: string }>) {
  const identificationType = params?.identificationType ?? "phone";
  const isPhone = identificationType === "phone";
  const storedValue = value?.identification ?? "";
  const [identification, setIdentification] = useState(storedValue);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    const trimmed = identification.trim();
    if (!trimmed) {
      setError(`${identificationType} is required`);
      return false;
    }
    setError(null);
    onSubmit({identification: trimmed});
    return true;
  }, [identification, identificationType, onSubmit]);

  useRegisterCheckoutValidation(onRegisterValidate, validate);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck />
          <CardTitle className="text-base">Know Your Customer </CardTitle>
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
            value={identification}
            onChange={(event) => {
              setIdentification(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            aria-invalid={error != null}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
