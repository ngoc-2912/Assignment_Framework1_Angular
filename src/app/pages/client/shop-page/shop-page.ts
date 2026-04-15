import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service'; 
import { IProduct, IProductCategory } from '../../../entities/product';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage implements OnInit {
  private productService = inject(ProductService);

  // Signals
  products = signal<IProduct[]>([]);
  categories = signal<IProductCategory[]>([]); // Danh sách danh mục từ API
  searchQuery = signal<string>('');
  selectedCategoryId = signal<string | number>('all');

  // Logic lọc tổng hợp
  filteredProducts = computed(() => {
    let result = this.products();

    // Lọc theo tên
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Lọc theo ID danh mục
    const cateId = this.selectedCategoryId();
    if (cateId !== 'all') {
      result = result.filter(p => p.category_id === Number(cateId));
    }

    return result;
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      // Gọi song song cả products và có thể là categories nếu service bạn có hỗ trợ
      const resProducts = await this.productService.list();
      this.products.set(resProducts.data || []);

      // Giả sử bạn có thêm api lấy categories, hoặc lấy từ chính list products
      // Ở đây tớ trích xuất categories duy nhất từ list products để lọc cho chuẩn
      const uniqueCates = resProducts.data
        .map(p => p.Category)
        .filter((value, index, self) => 
          value && self.findIndex(v => v?.id === value.id) === index
        ) as IProductCategory[];
      
      this.categories.set(uniqueCates);

    } catch (err: any) {
      console.error('Lỗi load data:', err);
    }
  }
}