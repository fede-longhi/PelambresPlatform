export const STORE_CART_STORAGE_KEY = 'pelambres.store.cart.v1';

export function getStoreCartHref() {
  return '/store/cart';
}

export function getStoreCartLineKey(
  productType: string,
  productId: string
): string {
  return `${productType}:${productId}`;
}
