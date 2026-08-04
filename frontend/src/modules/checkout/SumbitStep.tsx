import {useState} from "react";
import {useCheckoutContext} from "@/modules/checkout/CheckoutContext";
import {Button} from "@/ui/button";
import {Card, CardContent} from "@/ui/card";
import {Label} from "@/ui/label";

export function SubmitStep() {
    const [agreed, setAgreed] = useState(false);
    const {getStepParams} = useCheckoutContext();

    const handleSubmit = () => {
        console.log("Submit checkout", getStepParams());
    };

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
                    onClick={handleSubmit}
                    className="w-full"
                >
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
}
