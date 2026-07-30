import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {useQuote, useUser} from "@/hooks/useApi";
import {type WidgetDefinition} from "@/lib/api";

interface CheckoutRendererProps {
    config: Record<string, unknown>;
    quoteId: string;
}

function getWidgets(config: Record<string, unknown>): WidgetDefinition[] {
    return config.widgets as WidgetDefinition[];
}

export function CheckoutRenderer({config, quoteId}: CheckoutRendererProps) {
    const widgets = getWidgets(config);

    const {data: quote} = useQuote(quoteId);
    if (widgets.length === 0) {
        return (
            <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
                <p className="text-center text-sm text-muted-foreground">
                    No widgets in configuration
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
            {widgets.map((widget, index) => (
                <WidgetRenderer
                    key={widget.id ?? widget.stepName ?? index}
                    widget={widget}
                    quote={quote}
                />
            ))}
        </div>
    );
}
