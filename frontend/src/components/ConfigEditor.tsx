import { useCallback, useEffect, useState } from "react";
import { Check, FileJson } from "lucide-react";
import JSON5 from "json5";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { AsyncSelect } from "@/ui-extra/async-select";
import { Textarea } from "@/ui/textarea";
import { Card, CardContent } from "@/ui/card";
import {
  useConfigStore,
} from "@/stores/configStore";
import { parseCheckoutConfig } from "@/modules/checkout/types";
import { fetchExampleConfig } from "@/lib/api";
import { useQuoteIds } from "@/hooks/useApi";

export function ConfigEditor() {
  const configSource = useConfigStore((state) => state.configSource);
  const storedQuoteId = useConfigStore((state) => state.quoteId);
  const applyConfig = useConfigStore((state) => state.applyConfig);

  const { data: quoteIds, isLoading: quoteIdsLoading } = useQuoteIds();

  const [jsonText, setJsonText] = useState(() => configSource ?? "");
  const [quoteId, setQuoteId] = useState<string>(() => storedQuoteId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [exampleLoading, setExampleLoading] = useState(false);

  useEffect(() => {
    if (configSource !== null) {
      setJsonText(configSource);
    }
  }, [configSource]);

  useEffect(() => {
    setQuoteId(storedQuoteId ?? "");
  }, [storedQuoteId]);

  useEffect(() => {
    if (!quoteId && quoteIds?.length) {
      setQuoteId(quoteIds[0]);
    }
  }, [quoteId, quoteIds]);

  const handleApply = useCallback(() => {
    setError(null);
    try {
      const parsed = parseCheckoutConfig(JSON5.parse(jsonText));
      if (!parsed) {
        throw new Error("Configuration must be a JSON object with a widgets array");
      }
      applyConfig(parsed, jsonText, quoteId || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON5");
    }
  }, [applyConfig, jsonText, quoteId]);

  const handleExample = useCallback(async () => {
    setError(null);
    setExampleLoading(true);
    try {
      const example = await fetchExampleConfig();
      setJsonText(example);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load example config");
    } finally {
      setExampleLoading(false);
    }
  }, []);

  return (
    <Card className="flex h-full flex-col border-0 shadow-none">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="quote-id">Quote ID</Label>
          <AsyncSelect
            id="quote-id"
            value={quoteId}
            onValueChange={setQuoteId}
            options={quoteIds}
            isLoading={quoteIdsLoading}
            placeholder="Select quote"
            loadingMessage="Loading quotes…"
            emptyMessage="No quotes available"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Label htmlFor="config-json">JSON5</Label>
          <Textarea
            id="config-json"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="field-sizing-fixed min-h-0 flex-1 resize-none overflow-y-auto font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={handleApply}>
            <Check data-icon="inline-start" />
            Apply
          </Button>
          <Button variant="outline" onClick={handleExample} disabled={exampleLoading}>
            <FileJson data-icon="inline-start" />
            {exampleLoading ? "Loading…" : "Example"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
