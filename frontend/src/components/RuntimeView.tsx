import { ScrollArea } from "@/components/ui/scroll-area";
import { RuntimeViewHeader, WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { useQuote, useUser } from "@/hooks/useApi";
import type { WidgetDefinition } from "@/lib/api";
import { useConfigStore } from "@/stores/configStore";

function getWidgets(config: Record<string, unknown> | null): WidgetDefinition[] {
  if (!config || !Array.isArray(config.widgets)) {
    return [];
  }
  return config.widgets as WidgetDefinition[];
}

export function RuntimeView() {
  const config = useConfigStore((state) => state.config);

  const quoteId = typeof config?.quoteId === "string" ? config.quoteId : undefined;
  const widgets = getWidgets(config);
  const userWidget = widgets.find((w) => w.type === "userProfile");
  const userId = userWidget?.props?.userId as string | undefined;

  const { data: quote } = useQuote(quoteId);
  const { data: user } = useUser(userId);

  if (!config) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Apply a configuration to preview the runtime view
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <RuntimeViewHeader />
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
          {widgets.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No widgets in configuration
            </p>
          ) : (
            widgets.map((widget) => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                quote={widget.type === "quoteSummary" ? quote : undefined}
                user={widget.type === "userProfile" ? user : undefined}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
