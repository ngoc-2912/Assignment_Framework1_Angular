import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../entities/product';

const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'may-loc-khong-khi-sharp-fpz40e',
    name: 'May loc khong khi Sharp FP-Z40E',
    price: 3290000,
    oldPrice: 3790000,
    rating: 4.7,
    reviewCount: 164,
    category: 'Khong khi',
    brand: 'Sharp',
    shortDescription: 'Loc PM2.5, khoi mui, phu hop phong duoi 30m2.',
    description:
      'May loc khong khi Sharp su dung bo loc HEPA H13, van hanh em, co che do ngu va cam bien bui tu dong dieu chinh toc do quat.',
    imageUrl:
      'https://images.unsplash.com/photo-1626438251784-4d6f58d9f4d2?auto=format&fit=crop&w=800&q=80',
    tags: ['HEPA H13', 'PM2.5', 'Tiet kiem dien'],
    inStock: true,
  },
  {
    id: 2,
    slug: 'noi-chien-khong-dau-philips-hd9257',
    name: 'Noi chien khong dau Philips HD9257',
    price: 2690000,
    oldPrice: 3190000,
    rating: 4.8,
    reviewCount: 233,
    category: 'Nha bep',
    brand: 'Philips',
    shortDescription: 'Dung tich 5.6L, dieu khien cam ung, 7 chuong trinh nau.',
    description:
      'Cong nghe Rapid Air giup thuc pham gion deu, giam den 90% dau mo. Long noi chong dinh thao roi de ve sinh.',
    imageUrl:
      'https://images.unsplash.com/photo-1585515656763-6d8bbf4eb0f2?auto=format&fit=crop&w=800&q=80',
    tags: ['Rapid Air', 'Cam ung', '5.6L'],
    inStock: true,
  },
  {
    id: 3,
    slug: 'robot-hut-bui-xiaomi-s10',
    name: 'Robot hut bui Xiaomi S10',
    price: 5890000,
    oldPrice: 6490000,
    rating: 4.6,
    reviewCount: 119,
    category: 'Ve sinh',
    brand: 'Xiaomi',
    shortDescription: 'LUC hut 4000Pa, lap ban do thong minh, hut va lau 2 trong 1.',
    description:
      'Robot hut bui Xiaomi S10 co he thong dieu huong LDS, luu ban do nhieu tang, tro ly app theo doi theo thoi gian thuc.',
    imageUrl:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    tags: ['LDS', 'App dieu khien', '2 trong 1'],
    inStock: true,
  },
  {
    id: 4,
    slug: 'may-ep-cham-kangaroo-kg1b6',
    name: 'May ep cham Kangaroo KG1B6',
    price: 1790000,
    rating: 4.3,
    reviewCount: 72,
    category: 'Nha bep',
    brand: 'Kangaroo',
    shortDescription: 'Ong ep lon 78mm, dong co 200W, ep lien tuc 20 phut.',
    description:
      'May ep cham voi toc do quay thap giu lai nhieu vitamin, hoat dong on dinh va de lap rap chui rua.',
    imageUrl:
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    tags: ['Ong ep 78mm', '200W', 'Ep cham'],
    inStock: true,
  },
  {
    id: 5,
    slug: 'am-sieu-toc-locklock-ejk738',
    name: 'Am sieu toc Lock&Lock EJK738',
    price: 690000,
    rating: 4.5,
    reviewCount: 201,
    category: 'Nha bep',
    brand: 'Lock&Lock',
    shortDescription: 'Dung tich 1.7L, vo inox 304, tu ngat khi can.',
    description:
      'Am sieu toc cong suat 1800W, dun soi nhanh, an toan voi bo bao ve chong can va ro dien.',
    imageUrl:
      'https://images.unsplash.com/photo-1615485737456-6d9cc6fb1488?auto=format&fit=crop&w=800&q=80',
    tags: ['Inox 304', '1.7L', '1800W'],
    inStock: true,
  },
  {
    id: 6,
    slug: 'quat-dung-panasonic-f409',
    name: 'Quat dung Panasonic F-409',
    price: 1490000,
    oldPrice: 1690000,
    rating: 4.4,
    reviewCount: 98,
    category: 'Khong khi',
    brand: 'Panasonic',
    shortDescription: '3 cap do gio, che do hen gio, van hanh ben bi.',
    description:
      'Quat dung Panasonic F-409 thiet ke can bang, luong gio manh, phu hop phong khach va phong ngu.',
    imageUrl:
      'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80',
    tags: ['Hen gio', '3 cap do', 'Ben bi'],
    inStock: true,
  },
];

@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  private readonly productsSignal = signal<Product[]>(PRODUCTS);

  readonly products = computed(() => this.productsSignal());
  readonly categories = computed(() => {
    const group = new Set(this.products().map((item) => item.category));
    return ['Tat ca', ...Array.from(group)];
  });

  readonly featuredProducts = computed(() => this.products().slice(0, 4));

  getBySlug(slug: string): Product | undefined {
    return this.products().find((product) => product.slug === slug);
  }
}
