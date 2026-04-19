export interface IVariantProduct {
  id: number;
  name: string;
}

export interface IVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string | null;
  price: string;
  image: string | null;
  color?: string | null;
  size?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Product?: IVariantProduct;
}