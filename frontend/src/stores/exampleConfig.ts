export const EXAMPLE_CONFIG = {
    stepperView: "vertical", // vertical | stepper
    widgets: [
        {
            stepName: "Know Your Customer",
            widgetType: 'KycWidget',
            widgetParams: {
                identificationType: "phone" // phone | email
            }
        },
        {stepName: "Order Details", widgetType: 'OrderDetailsWidget'},
        {stepName: "Delivery", widgetType: 'DeliveryWidget'},
        {stepName: "Consents", widgetType: 'ConsentsWidget'}
    ]
}