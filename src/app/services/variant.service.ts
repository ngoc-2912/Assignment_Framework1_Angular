import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';
import { IVariant } from '../interfaces/variant.interface';

type VariantPayload = {
  product_id: number;
  name: string;
  sku: string | null;
  price: number;
  image: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class VariantService extends BaseApi {
  list() {
    return this.get<{ data: IVariant[] }>(API_ENDPOINT.variant.list);
  }

  getById(id: number) {
    return this.get<{ data: IVariant }>(`${API_ENDPOINT.variant.edit}/${id}`);
  }

  add(data: VariantPayload) {
    return this.post<{ data: IVariant }>(API_ENDPOINT.variant.add, data);
  }

  editVariant(id: number, data: VariantPayload) {
    return this.put<{ data: IVariant }>(`${API_ENDPOINT.variant.edit}/${id}`, data);
  }

  deleteVariant(id: number) {
    return this.delete<{ message?: string }>(`${API_ENDPOINT.variant.delete}/${id}`);
  }
}