import type { Product } from "../../../shared/QuoteType";

/** totalPrice = (nrcPrice - discountPrice) × count */
export function recalculateProductPrice(product: Product): Product {
  const unit =
    Number.parseFloat(product.priceInfo.nrcPrice) -
    product.priceInfo.discountPrice;
  const totalPrice = Math.round(unit * product.count * 100) / 100;
  return {
    ...product,
    priceInfo: {
      ...product.priceInfo,
      totalPrice,
    },
  };
}

export function recalculateOrderPrices(order: Product[]): Product[] {
  return order.map(recalculateProductPrice);
}
