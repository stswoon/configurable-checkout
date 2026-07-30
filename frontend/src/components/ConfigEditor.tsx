import { useCallback, useEffect, useState } from "react";
import { Check, FileJson } from "lucide-react";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import {Card, CardContent} from "@/ui/card";
import {
  useConfigStore,
  type ConfigJson,
} from "@/stores/configStore";
import {EXAMPLE_CONFIG} from "@/stores/exampleConfig";

function toEditorJson(config: ConfigJson | null): string {
  return JSON.stringify(config ?? {}, null, 2);
}

export function ConfigEditor() {
  const config = useConfigStore((state) => state.config);
  const applyConfig = useConfigStore((state) => state.applyConfig);

  const [jsonText, setJsonText] = useState(() => toEditorJson(config));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(toEditorJson(config));
  }, [config]);

  const handleApply = useCallback(() => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Configuration must be a JSON object");
      }
      applyConfig(parsed as ConfigJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [applyConfig, jsonText]);

  const handleExample = useCallback(() => {
    setError(null);
    setJsonText(JSON.stringify(EXAMPLE_CONFIG, null, 2));
  }, []);

  return (
    <Card className="flex h-full flex-col border-0 shadow-none">
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="config-json">JSON</Label>
          <Textarea
            id="config-json"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="min-h-0 flex-1 resize-none font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={handleApply}>
            <Check data-icon="inline-start" />
            Apply
          </Button>
          <Button variant="outline" onClick={handleExample}>
            <FileJson data-icon="inline-start" />
            Example
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
