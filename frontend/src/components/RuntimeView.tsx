import {ScrollArea} from "@/ui/scroll-area";
import { useConfigStore } from "@/stores/configStore";
import {CheckoutFlowWizard} from "@/modules/checkout/CheckoutFlowWizard";
import {LayoutTemplate} from "lucide-react";

export function RuntimeViewHeader() {
    return (
        <div className="flex items-center gap-2 border-b px-6 py-4">
            <LayoutTemplate />
            <div>
                <h2 className="font-semibold">Runtime View</h2>
                <p className="text-sm text-muted-foreground">Live widget preview from config</p>
            </div>
        </div>
    );
}

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
        <CheckoutFlowWizard config={config} quoteId={quoteId} />
      </ScrollArea>
    </div>
  );
}
