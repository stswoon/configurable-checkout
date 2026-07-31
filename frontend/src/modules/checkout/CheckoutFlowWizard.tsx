import {WidgetRenderer} from "@/modules/checkout/WidgetRenderer";
import {useQuote, useUser} from "@/hooks/useApi";
import {type WidgetDefinition} from "@/lib/api";
import {FormProvider, SubmitErrorHandler, SubmitHandler, useForm} from "react-hook-form";

interface CheckoutRendererProps {
    config: Record<string, unknown>;
    quoteId: string;
}

function getWidgets(config: Record<string, unknown>): WidgetDefinition[] {
    return config.widgets as WidgetDefinition[];
}

export function CheckoutFlowWizard({config, quoteId}: CheckoutRendererProps) {
    const widgets = getWidgets(config);
    const formMethods = useForm<CheckoutFormValues>();
    const {data: quote} = useQuote(quoteId);

    const onSubmit: SubmitHandler<CheckoutFormValues> = (data) =>
        console.log(data)
    const onError: SubmitErrorHandler<CheckoutFormValues> = (errors) =>
        console.log(errors)
    // const onSubmit = async (data) => {
    //     // async request which may result error
    //     try {
    //         // await fetch()
    //     } catch (e) {
    //         setError("root.serverError", {
    //             type: e.status,
    //             message: e.message,
    //         })
    //     }
    // }

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
            <FormProvider {...formMethods}>
                <form
                    onSubmit={formMethods.handleSubmit(onSubmit, onError)}
                    className='taProcessStepContainer'
                >
                    {widgets.map((widget) => (
                        <WidgetRenderer
                            key={widget.stepId}
                            widget={widget}
                            quote={quote}
                        />
                    ))}
                </form>
            </FormProvider>
        </div>
    );
}
