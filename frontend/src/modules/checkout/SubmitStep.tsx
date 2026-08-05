import {useState} from "react";
import {useSWRConfig} from "swr";
import type {Delivery, QuoteType} from "@shared/QuoteType";
import {submitQuote} from "@/lib/api";
import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
import {scrollToFirstCheckoutWidgetError} from "@/modules/checkout/hooks/useCheckoutWidgetForm";
import {Button} from "@/ui/button";
import {Card, CardContent} from "@/ui/card";
import {Checkbox} from "@/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/ui/dialog";
import {Label} from "@/ui/label";

export interface SubmitStepProps {
    quoteId: string;
}

function isDelivery(value: unknown): value is Delivery {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return typeof candidate.address === "string" && typeof candidate.date === "string";
}

function isUserInfo(value: unknown): value is QuoteType["userInfo"] {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.documentType === "string" &&
        typeof candidate.documentId === "string"
    );
}

function buildQuotePatch(stepParams: Record<string, unknown>): Partial<QuoteType> {
    const patch: Partial<QuoteType> = {};
    const delivery = stepParams.delivery;
    if (isDelivery(delivery)) {
        patch.delivery = delivery;
    }
    const userInfo = stepParams.userInfo;
    if (isUserInfo(userInfo)) {
        patch.userInfo = userInfo;
    }
    return patch;
}

export function SubmitStep({quoteId}: SubmitStepProps) {
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
            const updated = await submitQuote(quoteId, buildQuotePatch(stepParams));
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
