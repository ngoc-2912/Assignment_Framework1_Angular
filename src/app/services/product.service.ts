import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';
import { IProduct } from '../entities/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseApi {
  list(page: number = 1) {
  return this.get<any>(
    `${API_ENDPOINT.product.list}?page=${page}`
  );
}

  // Lấy tất cả sản phẩm (không phân trang) cho trang chi tiết
  getAll() {
  return this.get<any>(`${API_ENDPOINT.product.list}?page=1&limit=100`);
}

  add(data: any) {
    return this.post(API_ENDPOINT.product.add, data);
  }

  deleteProduct(id: number) {
    return this.delete(`${API_ENDPOINT.product.delete}/${id}`);
  }

  getById(id: number) {
    return this.get<{ data: IProduct }>(`${API_ENDPOINT.product.edit}/${id}`);
  }

  editProduct(id: number, data: any) {
    return this.put(`${API_ENDPOINT.product.edit}/${id}`, data);
  }
}