import type { ComponentType } from "react";
import { ConsentsWidget } from "./ConsentsWidget";
import { DeliveryWidget } from "./DeliveryWidget";
import { KycWidget } from "./KycWidget";
import { OrderDetailsWidget } from "./OrderDetailsWidget";
import { UnknownWidget } from "./UnknownWidget";
import type { WidgetProps } from "./types";

export const WIDGET_REGISTRY: Record<string, ComponentType<WidgetProps>> = {
  KycWidget,
  OrderDetailsWidget,
  DeliveryWidget,
  ConsentsWidget,
};

export { UnknownWidget };
export type { WidgetProps } from "./types";
export { resolveWidgetType, getWidgetParams } from "./types";
