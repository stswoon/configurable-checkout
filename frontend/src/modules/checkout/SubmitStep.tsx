import {useState} from "react";
import {useCheckoutContext, type StepParamsMap} from "@/modules/checkout/CheckoutContext";
import {Button} from "@/ui/button";
import {Card, CardContent} from "@/ui/card";
import {Label} from "@/ui/label";

interface SubmitStepProps {
    onSubmit: () => void;
}

export function SubmitStep({onSubmit}: SubmitStepProps) {
    const [agreed, setAgreed] = useState(false);

    return (
        <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-start gap-2">
                    <input
                        id="submit-terms"
                        type="checkbox"
                        className="mt-0.5 size-4 rounded border border-input"
                        checked={agreed}
                        onChange={(event) => setAgreed(event.target.checked)}
                    />
                    <Label htmlFor="submit-terms" className="font-normal leading-snug">
                        I agree with terms
                    </Label>
                </div>
                <Button
                    type="button"
                    disabled={!agreed}
                    onClick={onSubmit}
                    className="w-full"
                >
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
}
