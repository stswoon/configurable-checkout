import {useState} from "react";
import {useSWRConfig} from "swr";
import {submitQuote} from "@/lib/api";
import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
import {scrollToFirstCheckoutWidgetError} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import {buildQuotePatchFromStepParams} from "@/modules/checkout/stepParams";
import type {WidgetDefinition} from "@/modules/checkout/types";
import {Button} from "@/ui/button";
import {Card, CardContent} from "@/ui/card";
import {Checkbox} from "@/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/ui/dialog";
import {Label} from "@/ui/label";

export interface SubmitStepProps {
    quoteId: string;
    widgets: WidgetDefinition[];
}

export function SubmitStep({quoteId, widgets}: SubmitStepProps) {
    const {stepParams, validateSteps} = useCheckoutContext();
    const {mutate} = useSWRConfig();
    const [agreed, setAgreed] = useState(false);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleShow = () => {
        setOpen(true);
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!(await validateSteps())) {
            // Wait for RHF error class / aria-invalid to commit before scrolling.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToFirstCheckoutWidgetError();
                });
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const patch = buildQuotePatchFromStepParams(stepParams, widgets);
            const updated = await submitQuote(quoteId, patch);
            await mutate(["quote", quoteId], updated, {revalidate: false});
            setSubmitSuccess(true);
        } catch {
            setSubmitError("Failed to submit quote. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="submit-terms"
                            className="mt-0.5"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked)}
                        />
                        <Label htmlFor="submit-terms" className="font-normal leading-snug">
                            I ready to submit
                        </Label>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleShow}
                        >
                            Debug Checkout Context
                        </Button>
                        <Button
                            type="button"
                            disabled={!agreed || isSubmitting}
                            onClick={() => {
                                void handleSubmit();
                            }}
                        >
                            {isSubmitting ? "Submitting…" : "Submit"}
                        </Button>
                    </div>
                    {submitError ? (
                        <p className="text-destructive text-sm">{submitError}</p>
                    ) : null}
                    {submitSuccess ? (
                        <p className="text-sm text-muted-foreground">
                            Quote submitted — status is now IN_PROGRESS.
                        </p>
                    ) : null}
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger/>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Checkout step params</DialogTitle>
                        <DialogDescription>
                            Values from CheckoutContext.stepParams
                        </DialogDescription>
                    </DialogHeader>
                    <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs">
                        {JSON.stringify(stepParams, null, 2)}
                    </pre>
                    <DialogFooter showCloseButton />
                </DialogContent>
            </Dialog>
        </>
    );
}
