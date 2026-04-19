import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { ICartItem } from '../../../interfaces/cart.interface';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage implements OnInit {
  cartId = signal<number | null>(null);
  cartItems = signal<ICartItem[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  updatingItemIds = signal<number[]>([]);
  shippingFee = signal(20000);

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
  );

  total = computed(() => this.subtotal() + this.shippingFee());

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const res = await this.cartService.getMyCart();
      const cart = res?.data;

      console.log('Cart data:', cart);
      this.cartId.set(cart?.id ?? null);
      this.cartItems.set(cart?.CartItems ?? []);

    } catch {
      this.errorMessage.set('Không thể tải giỏ hàng. Vui lòng thử lại.');
      this.cartItems.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeItem(item: ICartItem) {
    try {
      await this.cartService.removeCartItem(item.id);
      this.cartItems.update((items) => items.filter((x) => x.id !== item.id));
    } catch {
      this.errorMessage.set('Không thể xóa sản phẩm khỏi giỏ hàng.');
    }
  }

  isUpdatingItem(id: number) {
    return this.updatingItemIds().includes(id);
  }

  async increaseQuantity(item: ICartItem) {
    await this.updateQuantity(item, item.quantity + 1);
  }

  async decreaseQuantity(item: ICartItem) {
    if (item.quantity <= 1) return;
    await this.updateQuantity(item, item.quantity - 1);
  }

  async onQuantityInput(item: ICartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const parsed = Number(input.value);
    const quantity = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : item.quantity;
    input.value = String(quantity);

    if (quantity !== item.quantity) {
      await this.updateQuantity(item, quantity);
    }
  }

  clearAll() {
    this.cartItems.set([]);
  }

  formatPrice(value: number | string) {
    return `${Number(value).toLocaleString('vi-VN')} VND`;
  }

  private async updateQuantity(item: ICartItem, quantity: number) {
    const previous = item.quantity;
    this.errorMessage.set('');
    this.patchItemQuantity(item.id, quantity);
    this.markUpdating(item.id, true);

    try {
      await this.cartService.updateCartItemQuantity(item.id, quantity);
    } catch {
      this.patchItemQuantity(item.id, previous);
      this.errorMessage.set('Không thể cập nhật số lượng. Vui lòng thử lại.');
    } finally {
      this.markUpdating(item.id, false);
    }
  }

  private patchItemQuantity(itemId: number, quantity: number) {
    this.cartItems.update((items) =>
      items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  }

  private markUpdating(itemId: number, isUpdating: boolean) {
    this.updatingItemIds.update((ids) =>
      isUpdating
        ? ids.includes(itemId)
          ? ids
          : [...ids, itemId]
        : ids.filter((id) => id !== itemId),
    );
  }
}
