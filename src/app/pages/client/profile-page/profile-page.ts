import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IUser } from '../../../interfaces/user.interface';
import { UiNotification } from '../../../components/ui/notification/notification';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UiNotification],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  user: IUser | null = null;
  orders: any[] = [];
  isLoadingProfile = false;
  isLoadingOrders = false;
  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' = 'success';

  formPassword = {
    oldPassword: '',
    newPassword: ''
  };

  activeTab: 'welcome' | 'profile' | 'orders' | 'password' = 'welcome';

  constructor(
    private profileService: ProfileService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.activeTab = 'welcome';

    this.loadProfile();
    this.loadOrders();
  }

  setTab(tab: 'profile' | 'orders' | 'password') {
    this.activeTab = tab;
  }

  loadProfile() {
    this.isLoadingProfile = true;
    this.toastMessage = '';

    this.userService.getMe()
      .then((res) => {
        if (res?.data?.full_name && res?.data?.email) {
          this.user = res.data;
          return;
        }

        this.user = null;
        this.showToast('Không đọc được dữ liệu hồ sơ từ getMe.', 'warning');
      })
      .catch(err => {
        console.log(err);
        this.user = null;
        this.showToast('Không thể tải hồ sơ từ getMe. Vui lòng thử lại.', 'danger');
      })
      .finally(() => {
        this.isLoadingProfile = false;
      });
  }

  loadOrders() {
    this.isLoadingOrders = true;

    this.profileService.getOrders()
      .then((res: any) => {
        this.orders = res?.data || [];
      })
      .catch(err => {
        console.log(err);
        this.orders = [];
      })
      .finally(() => {
        this.isLoadingOrders = false;
      });
  }

  changePassword() {
    this.profileService.changePassword(this.formPassword)
      .then(() => {
        this.showToast('Đổi mật khẩu thành công', 'success');
        this.formPassword = { oldPassword: '', newPassword: '' };
      })
      .catch(err => {
        console.log(err);
        this.showToast('Đổi mật khẩu thất bại', 'danger');
      });
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning') {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      if (this.toastMessage === message) {
        this.toastMessage = '';
      }
    }, 3000);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getOrderStatusClass(status: unknown): string {
    const value = Number(status);

    if (value === 0) return 'bg-warning-subtle text-warning-emphasis';
    if (value === 1) return 'bg-info-subtle text-info-emphasis';
    if (value === 2) return 'bg-primary-subtle text-primary-emphasis';
    return 'bg-success-subtle text-success-emphasis';
  }

  getOrderStatusLabel(status: unknown): string {
    const value = Number(status);

    if (value === 0) return 'Chờ xác nhận';
    if (value === 1) return 'Đã xác nhận';
    if (value === 2) return 'Đang giao';
    return 'Hoàn thành';
  }

  getAvatarInitial(): string {
    const fullName = this.user?.full_name?.trim();

    if (!fullName) {
      return 'U';
    }

    return fullName.charAt(0).toUpperCase();
  }

}