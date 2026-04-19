import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
  inject
} from '@angular/core';

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

  // STATE
  products = signal<IProduct[]>([]);
  categories = signal<IProductCategory[]>([]);

  searchQuery = signal('');
  selectedCategoryId = signal<string | number>('all');

  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);

  ngOnInit() {
    this.loadData(1);
  }

  // LOAD API (FIX CHUẨN THEO RESPONSE MỚI)
  async loadData(page: number) {
  try {
    const res: any = await this.productService.list(page);

    console.log('API:', res);

    // DATA
    const data = res?.data ?? [];

    this.products.set(data);

    // PAGINATION (QUAN TRỌNG)
    this.totalItems.set(res.totalItems);
    this.totalPages.set(res.totalPages);
    this.currentPage.set(res.currentPage);

    // CATEGORY UNIQUE
    const uniqueCategories: IProductCategory[] = Array.from(
      new Map<number, IProductCategory>(
        data
          .map((p: IProduct) => p.Category as IProductCategory)
          .filter((c: IProductCategory | null | undefined): c is IProductCategory => !!c && !!c.id)
          .map((c: IProductCategory) => [c.id, c])
      ).values()
    );

    this.categories.set(uniqueCategories);

  } catch (err) {
    console.error(err);
  }
}

  // FILTER
  filteredProducts = computed(() => {
    let result = this.products();

    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q)
      );
    }

    const cate = this.selectedCategoryId();
    if (cate !== 'all') {
      result = result.filter(
        p => Number(p.category_id) === Number(cate)
      );
    }

    return result;
  });

  // PAGE CHANGE
changePage(page: number) {
  if (page < 1 || page > this.totalPages()) return;

  this.loadData(page);
}

  get paginationRange(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}