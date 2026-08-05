export const EXAMPLE_CONFIG = {
    stepperView: "landing", // landing | stepper
    widgets: [
        {
            stepId: "userInfo",
            stepTitle: "Know Your Customer",
            widgetType: 'KycWidget',
            widgetParams: {
                identificationType: "phone" // phone | email
            }
        },
        {stepId: "order", stepTitle: "Order Details", widgetType: 'OrderDetailsWidget'},
        {stepId: "delivery", stepTitle: "Delivery", widgetType: 'DeliveryWidget'},
        {stepId: "n4", stepTitle: "Consents", widgetType: 'ConsentsWidget'}
    ]
}