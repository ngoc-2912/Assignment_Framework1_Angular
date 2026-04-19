import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';

type CreateOrderDetailPayload = {
  order_id: number;
  product_id?: number | null;
  variant_id?: number | null;
  quantity: number;
  price: number;
};

@Injectable({
  providedIn: 'root',
})
export class OrderDetailService extends BaseApi {
  create(payload: CreateOrderDetailPayload) {
    return this.post<{ orderDetail: { id: number } }>(API_ENDPOINT.orderDetail.add, payload);
  }
}
