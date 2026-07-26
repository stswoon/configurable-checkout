export interface WidgetDefinition {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

export interface CheckoutConfig {
  id: string;
  quoteId: string;
  widgets: WidgetDefinition[];
  updatedAt: string;
}

export interface IdpUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface QuoteLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  customerName: string;
  status: "draft" | "sent" | "accepted" | "expired";
  currency: string;
  lineItems: QuoteLineItem[];
  total: number;
  validUntil: string;
  updatedAt: string;
}

export const DEFAULT_CONFIG_ID = "default";

export async function fetchConfig(id: string): Promise<CheckoutConfig> {
  const res = await fetch(`/api/config/${id}`);
  if (!res.ok) throw new Error("Failed to load config");
  return res.json();
}

export async function saveConfig(id: string, config: Omit<CheckoutConfig, "id" | "updatedAt">): Promise<CheckoutConfig> {
  const res = await fetch(`/api/config/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to save config");
  return res.json();
}

export async function fetchUser(id: string): Promise<IdpUser> {
  const res = await fetch(`/api/idp/users/${id}`);
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

export async function fetchQuote(id: string): Promise<Quote> {
  const res = await fetch(`/api/quotes/${id}`);
  if (!res.ok) throw new Error("Failed to load quote");
  return res.json();
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
