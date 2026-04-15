import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
  
  // Sử dụng Signal để lưu danh sách sản phẩm
  products = signal<IProduct[]>([]);

  ngOnInit(): void {
    this.loadProducts();
  }

  // Chuyển sang async/await vì ProductService của bạn dùng Axios (Promise)
  async loadProducts() {
    try {
      // Gọi API bằng await
      const res = await this.productService.list();
      
      // Kiểm tra dữ liệu và cập nhật signal
      if (res && res.data) {
        this.products.set(res.data);
      }
    } catch (err: any) {
      // Định nghĩa kiểu :any cho err để tránh lỗi TS7006
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    }
  }
}