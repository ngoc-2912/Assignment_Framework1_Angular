import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { IUser } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, UiNotification],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetail implements OnInit {

  // ===== SIGNALS =====
  user = signal<IUser | null>(null);
  selectedActive = signal('1');
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  isSelfAccount = signal(false);

  // ===== VARIABLES =====
  protected id = 0;
  currentUserId = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  // ================= INIT =================
  ngOnInit(): void {
    this.getCurrentUser();
    this.loadUserDetail();
  }

  // ================= LẤY USER ĐANG LOGIN =================
  getCurrentUser() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || 0;
  }

  // ================= LOAD USER DETAIL =================
  loadUserDetail = async () => {
    try {
      const res = await this.userService.getById(this.id);

      this.user.set(res.data);
      this.selectedActive.set(res.data.active);

      // ⭐ Check nếu đang xem chính mình
      if (res.data.id === this.currentUserId) {
        this.isSelfAccount.set(true);
      }

    } catch {
      this.router.navigate(['/not-found'], {
        state: {
          message: 'Tài khoản không tồn tại!',
          linkUrl: '/admin/users'
        }
      });
    }
  };

  // ================= UPDATE ACTIVE =================
  updateActive = async () => {
    // ❌ Chặn khóa chính mình (UI level)
    if (this.isSelfAccount()) {
      this.showMessage('Bạn không thể vô hiệu hóa tài khoản đang đăng nhập!', 'danger');
      return;
    }

    try {
      await this.userService.updateActive(this.id, this.selectedActive());

      // update UI sau khi update thành công
      this.user.update((current) => {
        if (!current) return current;
        return { ...current, active: this.selectedActive() };
      });

      this.showMessage('Cập nhật trạng thái tài khoản thành công!', 'success');

    } catch (err: any) {
      const errorMessage = err?.error?.message || 'Cập nhật trạng thái tài khoản thất bại!';
      this.showMessage(errorMessage, 'danger');
    }
  };

  // ================= HELPER UI =================
  getRoleText(role: string) {
    return role === '1' ? 'Admin' : 'Khách hàng';
  }

  getRoleClass(role: string) {
    return role === '1' ? 'bg-primary' : 'bg-secondary';
  }

  getActiveText(active: string) {
    return active === '1' ? 'Hoạt động' : 'Bị khóa';
  }

  // ================= NOTIFICATION =================
  showMessage(msg: string, type: 'success' | 'danger') {
    this.message.set(msg);
    this.messageType.set(type);

    setTimeout(() => {
      this.message.set('');
      this.messageType.set('success');
    }, 3000);
  }
}