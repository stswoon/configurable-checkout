export interface QuoteType {
    id: string; //uuid
    status: "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "CANCELLED";
    order: Product[]
    userInfo: { documentType: string, documentId: string };
    delivery: Delivery;
}

export interface Product {
    id: string;
    name: string;
    count: number;
    priceInfo: {
        nrcPrice: string;
        discountPrice: number;
        totalPrice: number;
    };
}

export interface Delivery {
    address: string;
    date: string; // dd.mm.yyyy
}