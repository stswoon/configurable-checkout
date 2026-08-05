import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {CheckCircle2, ShieldCheck} from "lucide-react";
import {lookupUser} from "@/lib/api";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {KycStepValue} from "@/modules/checkout/stepParamHandlers";
import {CheckoutWidgetCard, WidgetForm} from "@/modules/checkout/widgets/CheckoutWidgetCard";
import {Badge} from "@/ui/badge";
import {Button} from "@/ui/button";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import type {CheckoutWidgetProps} from "./types";

export function KycWidget({
    stepId,
    value,
    onSubmit,
    params,
}: CheckoutWidgetProps<KycStepValue | undefined, {identificationType?: string}>) {
    const identificationType = params?.identificationType ?? "phone";
    const isPhone = identificationType === "phone";

    const [isValidating, setIsValidating] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    const form = useForm<KycStepValue>({
        defaultValues: {
            identification: value?.identification ?? "",
            verifiedUserId: value?.verifiedUserId,
            verifiedUserName: value?.verifiedUserName,
        },
    });

    const identification = form.watch("identification");
    const verifiedUserId = form.watch("verifiedUserId");
    const verifiedUserName = form.watch("verifiedUserName");
    const isVerified = Boolean(verifiedUserId && verifiedUserName);

    const {errorClassName} = useCheckoutWidgetForm(stepId, form, (data) => {
        onSubmit({
            identification: data.identification.trim(),
            verifiedUserId: data.verifiedUserId,
            verifiedUserName: data.verifiedUserName,
        });
    });

    const clearVerification = () => {
        setLookupError(null);
        form.setValue("verifiedUserId", undefined);
        form.setValue("verifiedUserName", undefined);
    };

    const applyVerification = (user: {id: string; name: string}, identificationValue: string) => {
        form.setValue("verifiedUserId", user.id);
        form.setValue("verifiedUserName", user.name);
        onSubmit({
            identification: identificationValue,
            verifiedUserId: user.id,
            verifiedUserName: user.name,
        });
    };

    const handleValidate = async () => {
        const trimmed = form.getValues("identification").trim();
        if (!trimmed) {
            await form.trigger("identification");
            return;
        }

        setIsValidating(true);
        setLookupError(null);
        try {
            const user = await lookupUser(isPhone ? {phone: trimmed} : {email: trimmed});
            applyVerification(user, trimmed);
            await form.trigger("identification");
        } catch {
            clearVerification();
            setLookupError("User not found. Check the value and try again.");
            form.setError("identification", {type: "validate", message: "User not found"});
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <CheckoutWidgetCard
            icon={ShieldCheck}
            title="Know Your Customer"
            errorClassName={errorClassName}
            badge={
                isVerified ? (
                    <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Verified
                    </Badge>
                ) : null
            }
        >
            <WidgetForm>
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
                                if (!form.getValues("verifiedUserId")) {
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
                                {isVerified && identification.trim() ? (
                                    <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        {verifiedUserName}
                                    </p>
                                ) : null}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </WidgetForm>
        </CheckoutWidgetCard>
    );
}
