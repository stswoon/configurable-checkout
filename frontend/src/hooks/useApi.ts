import useSWR from "swr";
import {
  DEFAULT_CONFIG_ID,
  fetchConfig,
  fetchQuote,
  fetchQuoteIds,
  fetchUser,
  type CheckoutConfig,
  type Quote,
  type IdpUser,
} from "@/lib/api";

export function useConfig(configId = DEFAULT_CONFIG_ID) {
  return useSWR<CheckoutConfig>(["config", configId], () => fetchConfig(configId));
}

export function useQuoteIds() {
  return useSWR<string[]>("quote-ids", fetchQuoteIds);
}

export function useQuote(quoteId: string | undefined) {
  return useSWR<Quote>(
    quoteId ? ["quote", quoteId] : null,
    () => fetchQuote(quoteId!),
  );
}

export function useUser(userId: string | undefined) {
  return useSWR<IdpUser>(
    userId ? ["user", userId] : null,
    () => fetchUser(userId!),
  );
}
