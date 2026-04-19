import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';
import { IUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseApi {
  list() {
    return this.get<{ data: IUser[] }>(API_ENDPOINT.user.list);
  }

  getById(id: number) {
    return this.get<{ data: IUser }>(`${API_ENDPOINT.user.detail}/${id}`);
  }

  updateActive(id: number, active: string) {
    return this.put(`${API_ENDPOINT.user.update}/${id}`, { active });
  }

  getMe() {
    return this.get<{ data: IUser }>(API_ENDPOINT.user.getMe);
  }
}