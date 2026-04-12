import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';
import { ICategory } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseApi {
  list() {
    return this.get<{ data: ICategory[] }>(API_ENDPOINT.category.list);
  }

  add(data: any) {
    return this.post(API_ENDPOINT.category.add, data);
  }

  deleteCategory(id: number) {
    return this.delete(`${API_ENDPOINT.category.delete}/${id}`);
  }

  getById(id: number) {
    return this.get<{ data: ICategory }>(`${API_ENDPOINT.category.edit}/${id}`);
  }

  editCategory(id: number, data: any) {
    return this.put(`${API_ENDPOINT.category.edit}/${id}`, data);
  }
}
