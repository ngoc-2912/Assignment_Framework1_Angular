export interface IOrderUser {
  id: number;
  full_name: string;
  email: string;
}

export interface IOrderDetailItem {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  quantity: number;
  price: string;
  name: string;
}

export interface IOrder {
  id: number;
  user_id: number;
  code: string;
  total_price: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  payment_method: string;
  phone: string;
  address: string;
  note: string;

  User: IOrderUser;
  OrderDetails: IOrderDetailItem[];
}