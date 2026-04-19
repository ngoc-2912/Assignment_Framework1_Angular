export interface ICartItem {
  id: number;
  cart_id: number;
  product_id: number | null;
  variant_id: number | null;
  image: string | null;
  name: string;
  quantity: number;
  price: string;
}

export interface ICart {
  id: number;
  user_id: number;
  createdAt: string;
  updatedAt: string;
  CartItems: ICartItem[];
}

export interface ICartListResponse {
  status: number;
  message: string;
  data: ICart | null;
}
