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

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders = async () => {
    try {
      const res = await this.orderService.list();
      if (res && res.data) {
        this.orders.set(res.data);
      }
    } catch {
      this.showMessage('Không thể tải danh sách đơn hàng!', 'danger');
    }
  };

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
