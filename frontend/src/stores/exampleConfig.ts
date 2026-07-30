export const EXAMPLE_CONFIG = {
    stepperView: "vertical", // vertical | stepper
    widgets: [
        {
            stepName: "Know Your Customer",
            widget: 'KycWidget',
            widgetParams: {
                identificationType: "phone" // phone | email
            }
        },
        {stepName: "Order Details", widget: 'OrderDetailsWidget'},
        {stepName: "Delivery", widget: 'DeliveryWidget'},
        {stepName: "Consents", widget: 'ConsentsWidget'}
    ]
}