import { ScrollArea } from "@/components/ui/scroll-area";
import { RuntimeViewHeader, WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { useQuote, useUser } from "@/hooks/useApi";
import type { CheckoutConfig } from "@/lib/api";

interface RuntimeViewProps {
  config: CheckoutConfig | undefined;
}

export function RuntimeView({ config }: RuntimeViewProps) {
  const quoteId = config?.quoteId;
  const userWidget = config?.widgets.find((w) => w.type === "userProfile");
  const userId = userWidget?.props?.userId as string | undefined;

  const { data: quote } = useQuote(quoteId);
  const { data: user } = useUser(userId);

  if (!config) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading runtime view…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <RuntimeViewHeader />
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
          {config.widgets.map((widget) => (
            <WidgetRenderer
              key={widget.id}
              widget={widget}
              quote={widget.type === "quoteSummary" ? quote : undefined}
              user={widget.type === "userProfile" ? user : undefined}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
