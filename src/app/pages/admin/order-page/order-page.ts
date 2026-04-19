import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IOrder } from '../../../interfaces/order.interface';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-page',
  imports: [RouterLink],
  templateUrl: './order-page.html',
  styleUrl: './order-page.scss'
})
export class OrderPage implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<IOrder[]>([]);
  message = signal('');
  messageType = signal('success');
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);

  ngOnInit(): void {
    this.loadOrders(1);
  }

  loadOrders = async (page: number = 1) => {
    try {
      const res = await this.orderService.list(page);
      if (res && res.data) {
        this.orders.set(res.data);
        this.totalPages.set(res.totalPages || 1);
        this.totalItems.set(res.totalItems || 0);
        this.currentPage.set(res.currentPage || page);
      }
    } catch {
      this.showMessage('Không thể tải danh sách đơn hàng!', 'danger');
    }
  };

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.loadOrders(page);
  }

  get paginationRange(): number[] {
    const total = this.totalPages();
    const maxVisible = 2;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    // Show first 2 pages, 3rd page only if there are exactly 3 pages
    if (total === 3) {
      return [1, 2, 3];
    }
    
    return [1, 2];
  }

  formatPrice(price: string) {
    return `${Number(price).toLocaleString('vi-VN')}đ`;
  }

  getStatusClass(status: string) {
    switch (status) {
      case '0':
        return 'bg-warning text-dark';
      case '1':
        return 'bg-info text-dark';
      case '2':
        return 'bg-primary';
      case '3':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string) {
    switch (status) {
      case '0':
        return 'Chờ xác nhận';
      case '1':
        return 'Đã xác nhận';
      case '2':
        return 'Đang giao';
      case '3':
        return 'Hoàn thành';
      default:
        return status;
    }
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
