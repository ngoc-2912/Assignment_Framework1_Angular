import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseApi {

  getProfile() {
    return this.get(API_ENDPOINT.user.profile);
  }

  getOrders() {
    return this.get(API_ENDPOINT.order.myOrders);
  }

  changePassword(data: any) {
    return this.post(API_ENDPOINT.user.changePassword, data);
  }
}