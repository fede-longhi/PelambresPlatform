export type StoreProductType = 'product' | 'design';

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  productType: StoreProductType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreProductCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type StoreProductImage = {
  id: string;
  url: string;
  sortOrder: number;
};

export type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  productType: StoreProductType;
  categories: StoreProductCategoryRef[];
  tags: string[];
  images: StoreProductImage[];
  priceCents: number;
  discountPercent: number | null;
  currency: string;
  stock: number | null;
  imageUrl: string | null;
  digitalFileUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreProductTableRow = {
  id: string;
  name: string;
  productType: StoreProductType;
  categories: StoreProductCategoryRef[];
  priceCents: number;
  discountPercent: number | null;
  currency: string;
  stock: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  updatedAt: string;
};

export type StoreOrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type StoreOrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  productType: StoreProductType;
  name: string;
  unitPriceCents: number;
  discountPercent: number | null;
  quantity: number;
  lineTotalCents: number;
  createdAt: string;
};

export type StoreOrder = {
  id: string;
  customerId: string | null;
  buyerEmail: string;
  buyerName: string;
  status: StoreOrderStatus;
  currency: string;
  totalCents: number;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: StoreOrderItem[];
};

export type StoreOrderTableRow = {
  id: string;
  buyerEmail: string;
  buyerName: string;
  status: StoreOrderStatus;
  currency: string;
  totalCents: number;
  itemName: string | null;
  productType: StoreProductType | null;
  mpPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
};

/** Persisted cart line (client-side). Prices resolved at checkout. */
export type StoreCartLine = {
  productId: string;
  productType: StoreProductType;
  quantity: number;
};
