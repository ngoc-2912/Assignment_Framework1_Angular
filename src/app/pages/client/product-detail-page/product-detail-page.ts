import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { UserService } from '../../../services/user.service';
import { IProduct } from '../../../entities/product';
import { IVariant } from '../../../interfaces/variant.interface';
import { UiNotification } from '../../../components/ui/notification/notification';


@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, CommonModule, UiNotification],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private cartService = inject(CartService);
  product = signal<IProduct | null>(null);
  allProducts = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);

  variants = signal<IVariant[]>([]);
  selectedVariant = signal<IVariant | null>(null);
  quantity = signal<number>(1);
  isAddingToCart = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'danger' | 'warning'>('success');
  private toastTimer?: ReturnType<typeof setTimeout>;

  relatedProducts = computed(() => {
    const currentProduct = this.product();
    if (!currentProduct || !currentProduct.category_id) return [];

    return this.allProducts()
      .filter(p => 
        p.category_id === currentProduct.category_id && 
        p.id !== currentProduct.id
      )
      .slice(0, 4);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productName = params.get('name');
      if (productName) {
        this.loadDetail(productName);
      }
    });
  }

  async loadDetail(nameFromUrl: string) {
    this.isLoading.set(true);
    this.selectedVariant.set(null);
    this.quantity.set(1);
    try {
      // Fetch all pages to find product by name
      let allData: any[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const res = await this.productService.list(page);
        const data = res.data || [];
        allData = [...allData, ...data];
        
        if (data.length < 6 || page >= res.totalPages) {
          hasMore = false;
        } else {
          page++;
        }
      }

      const decodedName = decodeURIComponent(nameFromUrl);
      const foundProduct = allData.find((p: any) => p.name === decodedName);

      this.product.set(foundProduct || null);
      this.allProducts.set(allData);

      // LOAD VARIANT
      if (foundProduct) {
        const resVariant = await fetch("http://localhost:3000/variants/list");

        const text = await resVariant.text(); // fix lỗi JSON
        const json = JSON.parse(text);

        const filtered = (json.data || []).filter(
          (v: IVariant) => v.product_id === foundProduct.id
        );

        this.variants.set(filtered);
        this.selectedVariant.set(filtered.length > 0 ? filtered[0] : null);

       
      }

 if (foundProduct && typeof window !== 'undefined') {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

    } catch (err) { 
      console.error(err);
      this.product.set(null);
    } finally {
      setTimeout(() => this.isLoading.set(false), 100);
    }
  }

  decreaseQuantity() {
    this.quantity.update((current) => Math.max(1, current - 1));
  }

  increaseQuantity() {
    this.quantity.update((current) => current + 1);
  }

  onQuantityInput(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.quantity.set(Number.isFinite(value) && value > 0 ? Math.floor(value) : 1);
  }

  onVariantSelect(event: Event) {
    const selectedId = Number((event.target as HTMLSelectElement).value);
    const selected = this.variants().find((variant) => variant.id === selectedId) ?? null;
    this.selectedVariant.set(selected);
  }

  getVariantLabel(variant: IVariant) {
    const size = variant.size?.trim();
    const color = variant.color?.trim();

    const details: string[] = [];
    if (size) details.push(`Size ${size}`);
    if (color) details.push(`Màu ${color}`);

    return details.length > 0 ? `${variant.name} - ${details.join(' - ')}` : variant.name;
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }

  closeToast() {
    this.toastMessage.set('');
  }

  private async getOrCreateCartId() {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    }

    try {
      const cartRes = await this.cartService.getMyCart();
      const existingCartId = Number(cartRes?.data?.id);

      if (Number.isInteger(existingCartId) && existingCartId > 0) {
        return existingCartId;
      }
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status && status !== 404) {
        throw new Error((error as any)?.response?.data?.message || 'Không thể lấy giỏ hàng');
      }
    }

    const meRes = await this.userService.getMe();
    const userId = Number(meRes?.data?.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Không xác định được tài khoản. Vui lòng đăng nhập lại');
    }

    try {
      const createCartRes = await this.cartService.addCart(userId);
      const createdCartId = Number(createCartRes?.cart?.id);

      if (Number.isInteger(createdCartId) && createdCartId > 0) {
        return createdCartId;
      }
    } catch (error) {
      const duplicatedCartId = Number((error as any)?.response?.data?.cart?.id);
      if (Number.isInteger(duplicatedCartId) && duplicatedCartId > 0) {
        return duplicatedCartId;
      }

      throw new Error((error as any)?.response?.data?.message || 'Không thể tạo giỏ hàng');
    }

    throw new Error('Không thể tạo giỏ hàng');
  }

  async addToCart() {
    const product = this.product();
    const variant = this.selectedVariant();
    const hasVariants = this.variants().length > 0;

    if (!product) {
      this.showToast('Không tìm thấy sản phẩm', 'danger');
      return;
    }

    if (hasVariants && !variant) {
      this.showToast('Vui lòng chọn biến thể trước khi thêm giỏ', 'warning');
      return;
    }

    this.isAddingToCart.set(true);

    try {
      const cartId = await this.getOrCreateCartId();

      const payload = hasVariants
        ? {
            cart_id: cartId,
            variant_id: Number(variant?.id),
            quantity: this.quantity(),
            price: Number(variant?.price ?? product.price),
          }
        : {
            cart_id: cartId,
            product_id: product.id,
            quantity: this.quantity(),
            price: Number(product.price),
          };

      await this.cartService.addCartItem(payload);

      this.showToast('Thêm vào giỏ hàng thành công', 'success');
    } catch (error) {
      const message = (error as any)?.response?.data?.message;
      this.showToast(message || (error as Error).message || 'Thêm vào giỏ thất bại', 'danger');
    } finally {
      this.isAddingToCart.set(false);
    }
  }
}