import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../config/end-point.config';
import { BaseApi } from './common/api.service';
import { ICartItem, ICartListResponse } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService extends BaseApi {
  getMyCart() {
    return this.get<ICartListResponse>(API_ENDPOINT.cart.list);
  }

  addCart(user_id: number) {
    return this.post<{ message?: string; cart?: { id: number } }>(API_ENDPOINT.cart.add, { user_id });
  }

  addCartItem(payload: {
    cart_id: number;
    product_id?: number;
    variant_id?: number;
    quantity: number;
    price: number;
  }) {
    return this.post<{ message?: string; cartItem?: ICartItem }>(API_ENDPOINT.cartItem.add, payload);
  }

  updateCartItemQuantity(id: number, quantity: number) {
    return this.put(`${API_ENDPOINT.cartItem.edit}/${id}`, { quantity });
  }

  removeCartItem(id: number) {
    return this.delete(`${API_ENDPOINT.cartItem.delete}/${id}`);
  }

  clearCartItems(items: ICartItem[]) {
    return Promise.all(items.map((item) => this.removeCartItem(item.id)));
  }
}
