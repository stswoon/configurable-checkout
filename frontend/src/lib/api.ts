import type { QuoteType } from "@shared/QuoteType";

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

export type { QuoteType as Quote } from "@shared/QuoteType";

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

export async function fetchQuote(id: string): Promise<QuoteType> {
  const res = await fetch(`/api/quotes/${id}`);
  if (!res.ok) throw new Error("Failed to load quote");
  return res.json();
}

export async function fetchQuoteIds(): Promise<string[]> {
  const res = await fetch("/api/quotes");
  if (!res.ok) throw new Error("Failed to load quote list");
  const data = (await res.json()) as { ids: string[] };
  return data.ids;
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function quoteOrderTotal(quote: QuoteType): number {
  return quote.order.reduce((sum, item) => sum + item.priceInfo.totalPrice, 0);
}
