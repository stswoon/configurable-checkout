import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {Truck} from "lucide-react";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import {CheckoutWidgetCard, WidgetForm} from "@/modules/checkout/widgets/CheckoutWidgetCard";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import type {CheckoutWidgetProps} from "./types";

interface DeliveryValue {
    address: string;
    date: string;
}

const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/;

const EMPTY_DELIVERY: DeliveryValue = {
    address: "",
    date: "",
};

export function DeliveryWidget({
    stepId,
    value,
    onSubmit,
}: CheckoutWidgetProps<DeliveryValue | undefined, unknown>) {
    const form = useForm<DeliveryValue>({
        defaultValues: value ?? EMPTY_DELIVERY,
    });

    useEffect(() => {
        if (value) {
            form.reset(value);
        }
    }, [form, value]);

    const {errorClassName} = useCheckoutWidgetForm(
        stepId,
        form,
        (data) => {
            onSubmit({
                address: data.address.trim(),
                date: data.date.trim(),
            });
        },
    );

    return (
        <CheckoutWidgetCard icon={Truck} title="Delivery" errorClassName={errorClassName}>
            <WidgetForm>
                <FieldGroup>
                    <Controller
                        name="address"
                        control={form.control}
                        rules={{
                            required: "Address is required",
                            validate: (current) =>
                                current.trim() ? true : "Address is required",
                        }}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid || undefined}>
                                <FieldLabel htmlFor="delivery-address">Address</FieldLabel>
                                <Input
                                    {...field}
                                    id="delivery-address"
                                    type="text"
                                    placeholder="Street, city"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid ? (
                                    <FieldError errors={[fieldState.error]}/>
                                ) : null}
                            </Field>
                        )}
                    />
                    <Controller
                        name="date"
                        control={form.control}
                        rules={{
                            required: "Delivery date is required",
                            validate: (current) => {
                                const trimmed = current.trim();
                                if (!trimmed) {
                                    return "Delivery date is required";
                                }
                                if (!DATE_PATTERN.test(trimmed)) {
                                    return "Use format dd.mm.yyyy";
                                }
                                return true;
                            },
                        }}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid || undefined}>
                                <FieldLabel htmlFor="delivery-date">Delivery date</FieldLabel>
                                <Input
                                    {...field}
                                    id="delivery-date"
                                    type="text"
                                    placeholder="dd.mm.yyyy"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldDescription>Format: dd.mm.yyyy</FieldDescription>
                                {fieldState.invalid ? (
                                    <FieldError errors={[fieldState.error]}/>
                                ) : null}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </WidgetForm>
        </CheckoutWidgetCard>
    );
}
