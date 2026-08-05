import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {Truck} from "lucide-react";
import {deliveryDateRules, trimRequired} from "@/modules/checkout/hooks/formRules";
import {useCheckoutWidgetForm} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import type {DeliveryStepValue} from "@/modules/checkout/stepParamHandlers";
import {CheckoutWidgetCard, WidgetForm} from "@/modules/checkout/widgets/CheckoutWidgetCard";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/ui/field";
import {Input} from "@/ui/input";
import type {CheckoutWidgetProps} from "./types";

const EMPTY_DELIVERY: DeliveryStepValue = {address: "", date: ""};

export function DeliveryWidget({
    stepId,
    value,
    onSubmit,
}: CheckoutWidgetProps<DeliveryStepValue | undefined, unknown>) {
    const form = useForm<DeliveryStepValue>({
        defaultValues: value ?? EMPTY_DELIVERY,
    });

    useEffect(() => {
        if (value) {
            form.reset(value);
        }
    }, [form, value]);

    const {errorClassName} = useCheckoutWidgetForm(stepId, form, (data) => {
        onSubmit({
            address: data.address.trim(),
            date: data.date.trim(),
        });
    });

    return (
        <CheckoutWidgetCard icon={Truck} title="Delivery" errorClassName={errorClassName}>
            <WidgetForm>
                <FieldGroup>
                    <Controller
                        name="address"
                        control={form.control}
                        rules={trimRequired("Address")}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid || undefined}>
                                <FieldLabel htmlFor="delivery-address">Address</FieldLabel>
                                <Input
                                    {...field}
                                    id="delivery-address"
                                    placeholder="Street, city"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid ? (
                                    <FieldError errors={[fieldState.error]} />
                                ) : null}
                            </Field>
                        )}
                    />
                    <Controller
                        name="date"
                        control={form.control}
                        rules={deliveryDateRules()}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid || undefined}>
                                <FieldLabel htmlFor="delivery-date">Delivery date</FieldLabel>
                                <Input
                                    {...field}
                                    id="delivery-date"
                                    placeholder="dd.mm.yyyy"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldDescription>Format: dd.mm.yyyy</FieldDescription>
                                {fieldState.invalid ? (
                                    <FieldError errors={[fieldState.error]} />
                                ) : null}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </WidgetForm>
        </CheckoutWidgetCard>
    );
}
