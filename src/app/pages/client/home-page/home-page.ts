import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service'; 
import { IProduct } from '../../../entities/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private productService = inject(ProductService);
  
  products = signal<IProduct[]>([]);

  // Tạo một signal mới chỉ chứa tối đa 4 sản phẩm
  featuredProducts = computed(() => {
    return this.products().slice(0, 4); // Cắt mảng lấy 4 phần tử đầu tiên
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const res = await this.productService.list();
      if (res && res.data) {
        this.products.set(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    }
  }
}