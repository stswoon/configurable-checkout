export const EXAMPLE_CONFIG = {
    stepperView: "vertical", // vertical | stepper
    widgets: [
        {
            stepId: "n1",
            stepTitle: "Know Your Customer",
            widgetType: 'KycWidget',
            widgetParams: {
                identificationType: "phone" // phone | email
            }
        },
        {stepId: "n2", stepTitle: "Order Details", widgetType: 'OrderDetailsWidget'},
        {stepId: "n3", stepTitle: "Delivery", widgetType: 'DeliveryWidget'},
        {stepId: "n4", stepTitle: "Consents", widgetType: 'ConsentsWidget'}
    ]
}