import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IOrder } from '../../../interfaces/order.interface';
import { OrderService } from '../../../services/order.service';
import { DatePipe } from '@angular/common';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-order-detail',
  imports: [DatePipe, UiNotification],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetail implements OnInit {
  order = signal<IOrder | null>(null);
  selectedStatus = signal('0');
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  protected id = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadOrderDetail();
  }

  loadOrderDetail = async () => {
    try {
      const result = await this.orderService.getById(this.id);
      this.order.set(result.data);
      this.selectedStatus.set(result.data.status);
    } catch {
      this.router.navigate(['/not-found'], {
        state: { message: 'Đơn hàng không tồn tại!', linkUrl: '/admin/orders' },
      });
    }
  };

  updateStatus = async () => {
    const currentStatus = Number(this.order()?.status ?? '0');
    const nextStatus = Number(this.selectedStatus());

    if (nextStatus < currentStatus) {
      this.showMessage('Không thể cập nhật lùi trạng thái đơn hàng!', 'danger');
      this.selectedStatus.set(String(currentStatus));
      return;
    }

    try {
      await this.orderService.updateStatus(this.id, this.selectedStatus());
      this.order.update((current) => {
        if (!current) return current;
        return { ...current, status: this.selectedStatus() };
      });
      this.showMessage('Cập nhật trạng thái thành công!', 'success');
    } catch {
      this.showMessage('Cập nhật trạng thái thất bại!', 'danger');
    }
  };

  canSelectStatus(status: string) {
    const currentStatus = Number(this.order()?.status ?? '0');
    return Number(status) >= currentStatus;
  }

  formatPrice(price: string) {
    return `${Number(price).toLocaleString('vi-VN')}đ`;
  }

  getLineTotal(price: string, quantity: number) {
    return `${(Number(price) * quantity).toLocaleString('vi-VN')}đ`;
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
      this.messageType.set('success');
    }, 3000);
  }
}
