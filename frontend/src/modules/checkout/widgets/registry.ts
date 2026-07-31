import type {ComponentType} from "react";
import type {WidgetProps} from "@/modules/checkout/widgets/types";
import {KycWidget} from "@/modules/checkout/widgets/KycWidget";
import {OrderDetailsWidget} from "@/modules/checkout/widgets/OrderDetailsWidget";
import {DeliveryWidget} from "@/modules/checkout/widgets/DeliveryWidget";
import {ConsentsWidget} from "@/modules/checkout/widgets/ConsentsWidget";

export const WIDGET_REGISTRY: Record<string, ComponentType<WidgetProps>> = {
    KycWidget,
    OrderDetailsWidget,
    DeliveryWidget,
    ConsentsWidget,
};