import {ScrollArea} from "@/ui/scroll-area";
import {RuntimeViewHeader} from "@/modules/checkout/WidgetRenderer";
import { useConfigStore } from "@/stores/configStore";
import {CheckoutRenderer} from "@/modules/checkout/CheckoutRenderer";

export function RuntimeView() {
  const config = useConfigStore((state) => state.config);
  const quoteId = useConfigStore((state) => state.quoteId);

  if (!config) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Apply a configuration to preview the runtime view
      </div>
    );
  }

    if (!quoteId) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Provide quoteId to preview the runtime view
            </div>
        );
    }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <RuntimeViewHeader />
      <ScrollArea className="flex-1">
        <CheckoutRenderer config={config} quoteId={quoteId} />
      </ScrollArea>
    </div>
  );
}
