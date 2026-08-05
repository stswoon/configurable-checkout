import type { QuoteType } from "@shared/QuoteType";

export interface WidgetDefinition {
  stepId: string;
  stepTitle: string;
  widgetType: string;
  widgetParams?: Record<string, unknown>;
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
  phone: string;
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

export async function lookupUser(query: {
  email?: string;
  phone?: string;
}): Promise<IdpUser> {
  const res = await fetch("/api/idp/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "User not found");
  }
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

export async function updateQuote(
  id: string,
  patch: Partial<QuoteType>,
): Promise<QuoteType> {
  const res = await fetch(`/api/quotes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update quote");
  return res.json();
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/** totalPrice = (nrcPrice - discountPrice) × count — mirrors backend quotePricing */
export function recalculateProductPrice(
  product: QuoteType["order"][number],
  count: number = product.count,
): QuoteType["order"][number] {
  const unit =
    Number.parseFloat(product.priceInfo.nrcPrice) -
    product.priceInfo.discountPrice;
  const totalPrice = Math.round(unit * count * 100) / 100;
  return {
    ...product,
    count,
    priceInfo: {
      ...product.priceInfo,
      totalPrice,
    },
  };
}

export function quoteOrderTotal(
  quote: Pick<QuoteType, "order"> | { order: QuoteType["order"] },
): number {
  return quote.order.reduce((sum, item) => sum + item.priceInfo.totalPrice, 0);
}
