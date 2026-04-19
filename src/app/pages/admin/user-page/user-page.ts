import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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
  private userService = inject(UserService);

  users = signal<IUser[]>([]);
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers = async () => {
    try {
      const res = await this.userService.list();
      if (res && res.data) {
        this.users.set(res.data);
      }
    } catch {
      this.showMessage('Không thể tải danh sách người dùng!', 'danger');
    }
  };

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
