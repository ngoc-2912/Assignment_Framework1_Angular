import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { IProduct } from '../../../entities/product';
import { ProductService } from '../../../services/product.service';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-product-page',
  imports: [RouterLink, UiNotification],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage implements OnInit {
  products = signal<IProduct[]>([]);
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  showModal = signal(false);
  selectedProduct = signal<IProduct | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts(1);
  }

  async loadProducts(page: number) {
    try {
      const res = await this.productService.list(page, true);
      if (res && res.data) {
        this.products.set(res.data);
        this.totalPages.set(res.totalPages || 1);
        this.totalItems.set(res.totalItems || 0);
        this.currentPage.set(res.currentPage || page);
      }
    } catch {
      this.showMessage('Không thể tải danh sách sản phẩm!', 'danger');
    }
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.loadProducts(page);
  }

  selectProduct(product: IProduct) {
    this.selectedProduct.set(product);
    this.showModal.set(true);
  }

  get paginationRange(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  confirmDelete() {
    const id = this.selectedProduct()?.id;
    if (!id) return;

    this.productService
      .deleteProduct(id)
      .then(() => {
        this.showModal.set(false);
        this.products.update((list) => list.filter((item) => item.id !== id));
        this.showMessage('Xóa sản phẩm thành công!', 'success');
      })
      .catch(() => {
        this.showModal.set(false);
        this.showMessage('Xóa sản phẩm thất bại!', 'danger');
      });
  }

  getImageUrl(image: string) {
    if (!image) {
      return 'https://placehold.co/80x80?text=No+Image';
    }

    return image.startsWith('http') ? image : `https://placehold.co/80x80?text=${encodeURIComponent(image)}`;
  }

  formatPrice(price: string) {
    return `${Number(price).toLocaleString('vi-VN')}đ`;
  }

  showMessage(msg: string, type: 'success' | 'danger') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => {
      this.message.set('');
      this.messageType.set('success');
    }, 3000);
  }

}