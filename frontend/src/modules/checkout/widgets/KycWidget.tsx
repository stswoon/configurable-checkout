import {useRef, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {CheckCircle2, ShieldCheck} from "lucide-react";
import {lookupUser} from "@/lib/api";
import {cn} from "@/lib/utils";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import {Badge} from "@/ui/badge";
import {Button} from "@/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import type {CheckoutWidgetProps} from "./types";

interface KycValue {
  identification: string;
  verifiedUserId?: string;
  verifiedUserName?: string;
}

interface VerifiedUser {
  id: string;
  name: string;
  identification: string;
}

export function KycWidget({
  value,
  onSubmit,
  params,
  onRegisterValidate,
}: CheckoutWidgetProps<KycValue | undefined, {identificationType?: string}>) {
  const identificationType = params?.identificationType ?? "phone";
  const isPhone = identificationType === "phone";

  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(() => {
    if (value?.verifiedUserId && value?.verifiedUserName && value.identification) {
      return {
        id: value.verifiedUserId,
        name: value.verifiedUserName,
        identification: value.identification,
      };
    }
    return null;
  });
  const verifiedUserRef = useRef(verifiedUser);
  verifiedUserRef.current = verifiedUser;

  const [isValidating, setIsValidating] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const form = useForm<KycValue>({
    defaultValues: {
      identification: value?.identification ?? "",
      verifiedUserId: value?.verifiedUserId,
      verifiedUserName: value?.verifiedUserName,
    },
  });

  const {errorClassName} = useCheckoutWidgetForm(
    form,
    (data) => {
      const current = verifiedUserRef.current;
      onSubmit({
        identification: data.identification.trim(),
        verifiedUserId: current?.id,
        verifiedUserName: current?.name,
      });
    },
    onRegisterValidate,
  );

  const clearVerification = () => {
    verifiedUserRef.current = null;
    setVerifiedUser(null);
    setLookupError(null);
    form.setValue("verifiedUserId", undefined);
    form.setValue("verifiedUserName", undefined);
  };

  const handleValidate = async () => {
    const identification = form.getValues("identification").trim();
    if (!identification) {
      await form.trigger("identification");
      return;
    }

    setIsValidating(true);
    setLookupError(null);
    try {
      const user = await lookupUser(
        isPhone ? {phone: identification} : {email: identification},
      );
      const next: VerifiedUser = {
        id: user.id,
        name: user.name,
        identification,
      };
      // Keep ref in sync before trigger — setState alone updates it only on next render.
      verifiedUserRef.current = next;
      setVerifiedUser(next);
      form.setValue("verifiedUserId", user.id);
      form.setValue("verifiedUserName", user.name);
      onSubmit({
        identification,
        verifiedUserId: user.id,
        verifiedUserName: user.name,
      });
      await form.trigger("identification");
    } catch {
      clearVerification();
      setLookupError("User not found. Check the value and try again.");
      form.setError("identification", {
        type: "validate",
        message: "User not found",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const isVerifiedForCurrent =
    verifiedUser !== null &&
    verifiedUser.identification === form.watch("identification").trim();

  return (
    <Card className={cn(errorClassName)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck />
          <CardTitle className="text-base">Know Your Customer</CardTitle>
          {isVerifiedForCurrent ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Verified
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldGroup>
            <FieldDescription>
              Verify your identity using{" "}
              {isPhone
                ? "phone number (+7 123 456 78 90)"
                : "email address (e.g. alice@example.com)"}
              .
            </FieldDescription>
            <Controller
              name="identification"
              control={form.control}
              rules={{
                required: `${identificationType} is required`,
                validate: (current) => {
                  const trimmed = current.trim();
                  if (!trimmed) {
                    return `${identificationType} is required`;
                  }
                  const verified = verifiedUserRef.current;
                  if (!verified || verified.identification !== trimmed) {
                    return "Please validate the user before submitting";
                  }
                  return true;
                },
              }}
              render={({field, fieldState}) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`kyc-${identificationType}`} className="capitalize">
                    {identificationType}
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id={`kyc-${identificationType}`}
                      type={isPhone ? "tel" : "email"}
                      placeholder={isPhone ? "+7 123 456 78 90" : "you@example.com"}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event);
                        clearVerification();
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isValidating}
                      onClick={() => {
                        void handleValidate();
                      }}
                    >
                      {isValidating ? "…" : "Validate"}
                    </Button>
                  </div>
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  {lookupError && !fieldState.invalid ? (
                    <FieldError>{lookupError}</FieldError>
                  ) : null}
                  {isVerifiedForCurrent ? (
                    <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      {verifiedUser.name}
                    </p>
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
