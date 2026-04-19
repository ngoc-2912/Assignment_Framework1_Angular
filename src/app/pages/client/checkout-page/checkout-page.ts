import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CartService } from '../../../services/cart.service';
import { ICartItem } from '../../../interfaces/cart.interface';
import { OrderService } from '../../../services/order.service';
import { OrderDetailService } from '../../../services/order-detail.service';
import { ProductService } from '../../../services/product.service';
import { IProduct } from '../../../entities/product';
import { UiNotification } from '../../../components/ui/notification/notification';
import { IUser } from '../../../interfaces/user.interface';

type CheckoutCartItem = ICartItem & { productName: string };

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, UiNotification],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage implements OnInit {
  isLoadingUser = signal(false);
  isLoadingCart = signal(false);
  isPlacingOrder = signal(false);
  submitted = signal(false);
  cartItems = signal<CheckoutCartItem[]>([]);
  toastMessage = signal('');
  toastType = signal<'success' | 'danger' | 'warning'>('success');
  userInfo = signal<IUser | null>(null);

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
  );

  checkoutForm = new FormGroup({
    full_name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
    address: new FormControl('', [Validators.required, Validators.minLength(10)]),
    payment_method: new FormControl('Thanh toán khi nhận hàng (COD)', [Validators.required]),
    note: new FormControl(''),
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cartService: CartService,
    private orderService: OrderService,
    private orderDetailService: OrderDetailService,
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadCart();
  }

  async loadUserInfo() {
    this.isLoadingUser.set(true);
    try {
      const userInfo = await this.userService.getMe();
      const user = userInfo?.data;
      if (user) {
        this.userInfo.set(user);
        this.checkoutForm.patchValue({
          full_name: user.full_name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          address: user.address ?? '',
        });
      }
    } catch (err) {
      this.showToast('Không thể tải thông tin người dùng', 'danger');
    } finally {
      this.isLoadingUser.set(false);
    }
  }

  async loadCart() {
    this.isLoadingCart.set(true);
    try {
      const cartRes = await this.cartService.getMyCart();
      const cart = cartRes?.data;
      const productsRes = await this.productService.getAll();
      const products = productsRes?.data || [];
      const productMap = new Map<number, IProduct>(products.map((p: IProduct) => [Number(p.id), p]));
      const mappedItems = (cart?.CartItems ?? []).map((item) => {
        const product = item.product_id ? productMap.get(Number(item.product_id)) : undefined;
        return {
          ...item,
          productName: product?.name ?? `Sản phẩm #${item.product_id ?? 'N/A'}`,
        };
      });
      this.cartItems.set(mappedItems);
    } catch (err) {
      this.showToast('Không thể tải giỏ hàng', 'danger');
    } finally {
      this.isLoadingCart.set(false);
    }
  }

  submitCheckout() {
    this.submitted.set(true);

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.showToast('Vui lòng nhập đầy đủ thông tin bắt buộc.', 'warning');
      return;
    }

    void this.placeOrder();
  }

  private async placeOrder() {
    if (this.cartItems().length === 0) {
      this.showToast('Giỏ hàng đang trống, không thể thanh toán.', 'warning');
      return;
    }

    this.isPlacingOrder.set(true);

    try {
      const value = this.checkoutForm.getRawValue();
      const totalPrice = this.subtotal();

      const orderRes = await this.orderService.create({
        full_name: value.full_name ?? '',
        email: value.email ?? '',
        phone: value.phone ?? '',
        address: value.address ?? '',
        payment_method: value.payment_method ?? 'Thanh toán khi nhận hàng (COD)',
        note: value.note ?? '',
        total_price: totalPrice,
      });

      const orderId = Number(orderRes?.order?.id);
      if (!Number.isFinite(orderId) || orderId <= 0) {
        throw new Error('Không lấy được mã đơn hàng vừa tạo');
      }

      for (const item of this.cartItems()) {
        const payload: {
          order_id: number;
          quantity: number;
          price: number;
          product_id?: number;
          variant_id?: number;
        } = {
          order_id: orderId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        };

        if (item.variant_id) {
          payload.variant_id = Number(item.variant_id);
        } else if (item.product_id) {
          payload.product_id = Number(item.product_id);
        }

        await this.orderDetailService.create(payload);
      }

      await this.cartService.clearCartItems(this.cartItems());
      this.cartItems.set([]);

      this.showToast('Thanh toán thành công!', 'success');

      await this.router.navigate(['/thank-you'], {
        queryParams: {
          orderId,
          amount: totalPrice,
        },
      });
    } catch {
      this.showToast('Thanh toán thất bại. Vui lòng thử lại.', 'danger');
    } finally {
      this.isPlacingOrder.set(false);
    }
  }

  private showToast(message: string, type: 'success' | 'danger' | 'warning') {
    this.toastMessage.set(message);
    this.toastType.set(type);
  }
}
