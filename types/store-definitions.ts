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
