import { useCallback } from "react";
import { mutate } from "swr";
import { ConfigEditor } from "@/components/ConfigEditor";
import { RuntimeView } from "@/components/RuntimeView";
import { Separator } from "@/components/ui/separator";
import { useConfig } from "@/hooks/useApi";
import { DEFAULT_CONFIG_ID } from "@/lib/api";

export function App() {
  const { data: config, isLoading, error } = useConfig();

  const handleSaved = useCallback(() => {
    mutate(["config", DEFAULT_CONFIG_ID]);
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold">Configurable Checkout</h1>
          <p className="text-sm text-muted-foreground">
            JSON config editor + runtime widget preview
          </p>
        </div>
        {config?.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Updated: {new Date(config.updatedAt).toLocaleString()}
          </p>
        )}
      </header>

      {error && (
        <div className="bg-destructive/10 px-6 py-2 text-sm text-destructive">
          Failed to load config. Is the backend running on port 3001?
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <section className="flex w-1/2 min-w-0 flex-col border-r p-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading config…</p>
          ) : (
            <ConfigEditor config={config} onSaved={handleSaved} />
          )}
        </section>

        <Separator orientation="vertical" className="hidden" />

        <section className="w-1/2 min-w-0">
          <RuntimeView config={config} />
        </section>
      </div>
    </div>
  );
}
