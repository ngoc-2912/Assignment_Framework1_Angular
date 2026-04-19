import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { IUser } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, RouterLink, UiNotification],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetail implements OnInit {
  user = signal<IUser | null>(null);
  selectedActive = signal('1');
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  protected id = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadUserDetail();
  }

  loadUserDetail = async () => {
    try {
      const res = await this.userService.getById(this.id);
      this.user.set(res.data);
      this.selectedActive.set(res.data.active);
    } catch {
      this.router.navigate(['/not-found'], { state: { message: 'Tài khoản không tồn tại!', linkUrl: '/admin/users' } });
    }
  };

  updateActive = async () => {
    try {
      await this.userService.updateActive(this.id, this.selectedActive());
      this.user.update((current) => {
        if (!current) return current;
        return { ...current, active: this.selectedActive() };
      });
      this.showMessage('Cập nhật trạng thái tài khoản thành công!', 'success');
    } catch {
      this.showMessage('Cập nhật trạng thái tài khoản thất bại!', 'danger');
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

  showMessage(msg: string, type: 'success' | 'danger') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => {
      this.message.set('');
      this.messageType.set('success');
    }, 3000);
  }
}
