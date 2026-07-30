import type { ComponentType } from "react";
import { ConsentsWidget } from "./ConsentsWidget";
import { ContactFormWidget } from "./ContactFormWidget";
import { DeliveryWidget } from "./DeliveryWidget";
import { HeaderWidget } from "./HeaderWidget";
import { KycWidget } from "./KycWidget";
import { OrderDetailsWidget } from "./OrderDetailsWidget";
import { PaymentWidget } from "./PaymentWidget";
import { QuoteSummaryWidget } from "./QuoteSummaryWidget";
import { UnknownWidget } from "./UnknownWidget";
import { UserProfileWidget } from "./UserProfileWidget";
import type { WidgetProps } from "./types";

export const WIDGET_REGISTRY: Record<string, ComponentType<WidgetProps>> = {
  header: HeaderWidget,
  userProfile: UserProfileWidget,
  quoteSummary: QuoteSummaryWidget,
  contactForm: ContactFormWidget,
  payment: PaymentWidget,
  KycWidget,
  OrderDetailsWidget,
  DeliveryWidget,
  ConsentsWidget,
};

export { UnknownWidget };
export type { WidgetProps } from "./types";
export { resolveWidgetType, getWidgetParams } from "./types";
