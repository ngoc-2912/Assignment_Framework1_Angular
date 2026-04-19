import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { IProduct } from '../../../entities/product';
import { IVariant } from '../../../interfaces/variant.interface';


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
  isLoading = signal<boolean>(true);

  // ✅ THÊM
  variants = signal<IVariant[]>([]);
  selectedVariant = signal<IVariant | null>(null);

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

      // ✅ LOAD VARIANT
      if (foundProduct) {
        const resVariant = await fetch("http://localhost:3000/variants/list");

        const text = await resVariant.text(); // fix lỗi JSON
        const json = JSON.parse(text);

        const filtered = (json.data || []).filter(
          (v: IVariant) => v.product_id === foundProduct.id
        );

        this.variants.set(filtered);

       
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

  addToCart() {
    const product = this.product();
    const variant = this.selectedVariant();

    if (this.variants().length > 0 && !variant) {
      alert("Chọn biến thể đi");
      return;
    }

    const item = {
      product_id: product?.id,
      variant_id: variant?.id || null,
      name: product?.name,
      variant: variant?.name,
      price: Number(variant?.price || product?.price),
      quantity: 1
    };

    console.log("Cart:", item);
  }
}