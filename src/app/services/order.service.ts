import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';
import { IOrder } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseApi {
  list() {
    return this.get<{ data: IOrder[] }>(API_ENDPOINT.order.list);
  }

  getById(id: number) {
    return this.get<{ data: IOrder }>(`${API_ENDPOINT.order.detail}/${id}`);
  }

  updateStatus(id: number, status: string) {
    return this.put(`${API_ENDPOINT.order.update}/${id}`, { status });
  }
}