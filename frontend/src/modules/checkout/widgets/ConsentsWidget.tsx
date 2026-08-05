import {Controller, useForm} from "react-hook-form";
import {ClipboardCheck} from "lucide-react";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import {CheckoutWidgetCard, WidgetForm} from "@/modules/checkout/widgets/CheckoutWidgetCard";
import {Checkbox} from "@/ui/checkbox";
import {Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet} from "@/ui/field";
import type {CheckoutWidgetProps} from "./types";

interface ConsentDef {
    id: string;
    label: string;
    required?: boolean;
}

const DEFAULT_CONSENTS: ConsentDef[] = [
    {id: "terms", label: "I agree to the Terms of Service", required: true},
    {id: "privacy", label: "I agree to the Privacy Policy", required: true},
    {id: "marketing", label: "I agree to receive marketing communications", required: false},
];

type ConsentsValue = Record<string, boolean>;

function buildDefaultValues(consents: ConsentDef[], value?: ConsentsValue): ConsentsValue {
    return consents.reduce<ConsentsValue>((acc, consent) => {
        acc[consent.id] = Boolean(value?.[consent.id]);
        return acc;
    }, {});
}

export function ConsentsWidget({
    stepId,
    value,
    onSubmit,
    params,
}: CheckoutWidgetProps<ConsentsValue | undefined, {consents?: ConsentDef[]}>) {
    const consents = params?.consents ?? DEFAULT_CONSENTS;

    const form = useForm<ConsentsValue>({
        defaultValues: buildDefaultValues(consents, value),
    });

    const {errorClassName} = useCheckoutWidgetForm(stepId, form, onSubmit);

    return (
        <CheckoutWidgetCard icon={ClipboardCheck} title="Consents" errorClassName={errorClassName}>
            <WidgetForm>
                <FieldSet>
                    <FieldGroup data-slot="checkbox-group">
                        {consents.map((consent) => (
                            <Controller
                                key={consent.id}
                                name={consent.id}
                                control={form.control}
                                rules={
                                    consent.required
                                        ? {
                                              validate: (checked) =>
                                                  checked === true || "Please accept all required consents",
                                          }
                                        : undefined
                                }
                                render={({field, fieldState}) => (
                                    <Field
                                        orientation="horizontal"
                                        data-invalid={fieldState.invalid || undefined}
                                    >
                                        <Checkbox
                                            id={`consent-${consent.id}`}
                                            checked={Boolean(field.value)}
                                            onCheckedChange={field.onChange}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor={`consent-${consent.id}`} className="font-normal">
                                                {consent.label}
                                                {consent.required ? " *" : ""}
                                            </FieldLabel>
                                            {fieldState.invalid ? (
                                                <FieldError errors={[fieldState.error]} />
                                            ) : null}
                                        </FieldContent>
                                    </Field>
                                )}
                            />
                        ))}
                    </FieldGroup>
                </FieldSet>
            </WidgetForm>
        </CheckoutWidgetCard>
    );
}
