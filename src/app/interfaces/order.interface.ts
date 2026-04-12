export interface IOrderUser {
  id: number;
  full_name: string;
  email: string;
}

export interface IOrderDetailItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
}

export interface IOrder {
  id: number;
  user_id: number;
  code: string;
  total_price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  User: IOrderUser;
  OrderDetails: IOrderDetailItem[];
}