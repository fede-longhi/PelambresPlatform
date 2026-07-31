'use server';

import { fetchPublishedStoreProductsByIds } from '@/lib/data/store-product-data';

export async function loadStoreCartProducts(productIds: string[]) {
  return fetchPublishedStoreProductsByIds(productIds);
}
