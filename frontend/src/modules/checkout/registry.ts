import type {ComponentType} from "react";
import type {CheckoutWidgetProps} from "@/modules/checkout/widgets/types";
import {KycWidget} from "@/modules/checkout/widgets/KycWidget";
import {OrderDetailsWidget} from "@/modules/checkout/widgets/OrderDetailsWidget";
import {DeliveryWidget} from "@/modules/checkout/widgets/DeliveryWidget";
import {ConsentsWidget} from "@/modules/checkout/widgets/ConsentsWidget";

type RegisteredWidget = ComponentType<CheckoutWidgetProps<unknown, unknown>>;

export const WIDGET_REGISTRY: Record<string, RegisteredWidget> = {
    KycWidget: KycWidget as RegisteredWidget,
    OrderDetailsWidget: OrderDetailsWidget as RegisteredWidget,
    DeliveryWidget: DeliveryWidget as RegisteredWidget,
    ConsentsWidget: ConsentsWidget as RegisteredWidget,
};