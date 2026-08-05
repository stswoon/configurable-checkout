export function trimRequired(label: string) {
    return {
        required: `${label} is required`,
        validate: (value: string) => (value.trim() ? true : `${label} is required`),
    };
}

export const DELIVERY_DATE_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/;

export function deliveryDateRules() {
    return {
        required: "Delivery date is required",
        validate: (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
                return "Delivery date is required";
            }
            if (!DELIVERY_DATE_PATTERN.test(trimmed)) {
                return "Use format dd.mm.yyyy";
            }
            return true;
        },
    };
}
