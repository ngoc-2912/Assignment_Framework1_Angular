import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IUser } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-user-page',
  imports: [RouterLink, UiNotification],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPage implements OnInit {
  private readonly pageSize = 5;
  private userService = inject(UserService);

  users = signal<IUser[]>([]);
  allUsers = signal<IUser[]>([]);
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  isClientPaging = signal(false);

  paginationRange = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadUsers(1);
  }

  loadUsers = async (page: number = 1) => {
    try {
      const res = await this.userService.list(page);
      if (res && res.data) {
        const apiUsers = res.data;
        const apiTotalItems = res.totalItems ?? apiUsers.length;
        const apiTotalPages = res.totalPages ?? Math.max(1, Math.ceil(apiTotalItems / this.pageSize));

        if (apiUsers.length > this.pageSize) {
          this.isClientPaging.set(true);
          this.allUsers.set(apiUsers);
          this.totalItems.set(apiUsers.length);
          this.totalPages.set(Math.max(1, Math.ceil(apiUsers.length / this.pageSize)));
          this.applyClientPage(page);
          return;
        }

        this.isClientPaging.set(false);
        this.users.set(apiUsers);
        this.totalPages.set(apiTotalPages);
        this.totalItems.set(apiTotalItems);
        this.currentPage.set(res.currentPage || page);
      }
    } catch {
      this.showMessage('Không thể tải danh sách người dùng!', 'danger');
    }
  };

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    if (this.isClientPaging()) {
      this.applyClientPage(page);
      return;
    }

    this.loadUsers(page);
  }

  private applyClientPage(page: number) {
    const safePage = Math.min(Math.max(page, 1), this.totalPages());
    const start = (safePage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.users.set(this.allUsers().slice(start, end));
    this.currentPage.set(safePage);
  }

  getRoleText(role: string) {
    return role === '1' ? 'Admin' : 'Khách hàng';
  }

  getRoleClass(role: string) {
    return role === '1' ? 'bg-primary' : 'bg-secondary';
  }

  getActiveText(active: string) {
    return active === '1' ? 'Hoạt động' : 'Bị khóa';
  }

  getActiveClass(active: string) {
    return active === '1' ? 'bg-success' : 'bg-danger';
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
