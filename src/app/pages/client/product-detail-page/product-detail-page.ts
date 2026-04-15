import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { IProduct } from '../../../entities/product';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product = signal<IProduct | null>(null);
  allProducts = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true); // Thêm biến này để quản lý loading

  relatedProducts = computed(() => {
    const currentProduct = this.product();
    // Nếu không có sản phẩm HOẶC sản phẩm đó không có category_id thì không tìm hàng liên quan
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
      // Lấy 'name' từ URL thay vì 'slug'
      const productName = params.get('name'); 
      if (productName) {
        this.loadDetail(productName);
      }
    });
  }
  
  async loadDetail(nameFromUrl: string) {
    this.isLoading.set(true);
    try {
      const res = await this.productService.list();
      const data = res.data || [];
      this.allProducts.set(data);
  
      // TÌM THEO NAME:
      // Dùng decodeURIComponent để xử lý tiếng Việt có dấu từ URL truyền xuống
      const decodedName = decodeURIComponent(nameFromUrl);
      const foundProduct = data.find((p: any) => p.name === decodedName);
      
      this.product.set(foundProduct || null);
      
      if (foundProduct) window.scrollTo({ top: 0, behavior: 'smooth' });
  
    } catch (err) {
      this.product.set(null);
    } finally {
      setTimeout(() => this.isLoading.set(false), 100);
    }
  }
}