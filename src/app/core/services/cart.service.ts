import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../entities/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'lab02_cart';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly itemsSignal = signal<CartItem[]>(this.loadInitialItems());

  readonly items = computed(() => this.itemsSignal());
  readonly totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  add(product: Product, quantity = 1): void {
    const safeQuantity = Math.max(1, quantity);
    this.itemsSignal.update((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item,
        );
      }
      return [...items, { product, quantity: safeQuantity }];
    });
    this.persist();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this.itemsSignal.update((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
    this.persist();
  }

  remove(productId: number): void {
    this.itemsSignal.update((items) =>
      items.filter((item) => item.product.id !== productId),
    );
    this.persist();
  }

  clear(): void {
    this.itemsSignal.set([]);
    this.persist();
  }

  private loadInitialItems(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
  }
}
