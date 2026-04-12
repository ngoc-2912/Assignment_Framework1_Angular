import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { IProduct } from '../../../entities/product';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage implements OnInit {
  products = signal<IProduct[]>([]);
  message = signal('');
  messageType = signal('success');
  showModal = signal(false);
  selectedProduct = signal<IProduct | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts = async () => {
    try {
      const res = await this.productService.list();
      if (res && res.data) {
        this.products.set(res.data);
      }
    } catch {
      this.showMessage('Không thể tải danh sách sản phẩm!', 'danger');
    }
  };

  selectProduct(product: IProduct) {
    this.selectedProduct.set(product);
    this.showModal.set(true);
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
      this.messageType.set('');
    }, 3000);
  }

}