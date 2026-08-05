import {useState} from "react";
import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
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
} from "@/ui/dialog";
import {Label} from "@/ui/label";

export function SubmitStep() {
    const {stepParams, validateSteps} = useCheckoutContext();
    const [agreed, setAgreed] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        if (!(await validateSteps())) {
            return;
        }
        setOpen(true);
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
                    <Button
                        type="button"
                        disabled={!agreed}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Checkout step params</DialogTitle>
                        <DialogDescription>
                            Submitted values from CheckoutContext.stepParams
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
