import { useCallback, useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_CONFIG_ID,
  saveConfig,
  type CheckoutConfig,
  type WidgetDefinition,
} from "@/lib/api";

interface ConfigEditorProps {
  config: CheckoutConfig | undefined;
  onSaved: () => void;
}

function toEditorJson(config: CheckoutConfig): string {
  return JSON.stringify(
    { quoteId: config.quoteId, widgets: config.widgets },
    null,
    2,
  );
}

export function ConfigEditor({ config, onSaved }: ConfigEditorProps) {
  const [quoteId, setQuoteId] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setQuoteId(config.quoteId);
      setJsonText(toEditorJson(config));
      setError(null);
    }
  }, [config]);

  const handleReset = useCallback(() => {
    if (config) {
      setQuoteId(config.quoteId);
      setJsonText(toEditorJson(config));
      setError(null);
    }
  }, [config]);

  const handleSave = useCallback(async () => {
    setError(null);
    let widgets: WidgetDefinition[];
    try {
      const parsed = JSON.parse(jsonText) as {
        quoteId?: string;
        widgets?: WidgetDefinition[];
      };
      if (!Array.isArray(parsed.widgets)) {
        throw new Error('"widgets" must be an array');
      }
      widgets = parsed.widgets;
      if (parsed.quoteId !== undefined) {
        setQuoteId(parsed.quoteId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }

    setSaving(true);
    try {
      await saveConfig(DEFAULT_CONFIG_ID, {
        quoteId: quoteId || (JSON.parse(jsonText) as { quoteId?: string }).quoteId || "",
        widgets,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [jsonText, quoteId, onSaved]);

  return (
    <Card className="flex h-full flex-col border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Config Editor</CardTitle>
            <CardDescription>
              Edit checkout layout JSON and quote reference
            </CardDescription>
          </div>
          <Badge variant="secondary">{DEFAULT_CONFIG_ID}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="quoteId">Quote ID</Label>
          <Input
            id="quoteId"
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            placeholder="quote-001"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="config-json">Configuration JSON</Label>
          <Textarea
            id="config-json"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="min-h-[420px] flex-1 resize-none font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || !config}>
            <Save data-icon="inline-start" />
            {saving ? "Saving…" : "Save to backend"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!config}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
