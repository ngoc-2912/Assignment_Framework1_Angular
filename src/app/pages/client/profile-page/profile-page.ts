import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IUser } from '../../../interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';
import { UiNotification } from '../../../components/ui/notification/notification';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UiNotification],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  private platformId = inject(PLATFORM_ID);

  user: IUser | null = null;
  toastMessage = '';
  toastType: 'success' | 'danger' | 'warning' | 'info' = 'info';
  orders: any[] = [];
  isLoadingProfile = false;
  isLoadingOrders = false;
  profileError = '';

  formPassword = {
    oldPassword: '',
    newPassword: ''
  };

  activeTab: 'welcome' | 'profile' | 'orders' | 'password' = 'welcome';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.refreshData();
  }

  refreshData() {
    this.activeTab = 'welcome';
    this.loadProfile();
    this.loadOrders();
  }

  setTab(tab: 'profile' | 'orders' | 'password') {
    this.activeTab = tab;
  }

  loadProfile() {
    this.isLoadingProfile = true;
    this.profileError = '';

    this.profileService.getProfile()
      .then((res: any) => {
        const mappedUser = this.extractUserFromResponse(res);
        if (mappedUser) {
          this.user = mappedUser;
        } else {
          this.user = this.getFallbackUserFromToken();
          this.profileError = 'Không đọc được dữ liệu hồ sơ từ backend.';
        }
      })
      .catch(err => {
        console.error('Profile Error:', err);
        this.user = this.getFallbackUserFromToken();

        if (err?.response?.status === 401) {
          this.toastType = 'warning';
        }

        this.profileError = 'Không thể tải hồ sơ. Vui lòng thử lại.';
      })
      .finally(() => {
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      });
  }

  loadOrders() {
    this.isLoadingOrders = true;

    this.profileService.getOrders()
      .then((res: any) => {
     
        this.orders = res?.data || res || [];
      })
      .catch(err => {
        console.error('Orders Error:', err);

        if (err?.response?.status === 401) {
          this.toastType = 'warning';
        }

        this.orders = [];
      })
      .finally(() => {
        this.isLoadingOrders = false;
        this.cdr.detectChanges();  
      });
  }

  changePassword() {
    if (!this.formPassword.oldPassword || !this.formPassword.newPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    this.profileService.changePassword(this.formPassword)
      .then(() => {
        alert('Đổi mật khẩu thành công');
        this.formPassword = { oldPassword: '', newPassword: '' };
      })
      .catch(err => {
        console.error(err);
        alert('Đổi mật khẩu thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
      })
      .finally(() => this.cdr.detectChanges());
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }


  getOrderStatusClass(status: any): string {
    const value = Number(status);
    if (value === 0) return 'bg-warning-subtle text-warning-emphasis';
    if (value === 1) return 'bg-info-subtle text-info-emphasis';
    if (value === 2) return 'bg-primary-subtle text-primary-emphasis';
    return 'bg-success-subtle text-success-emphasis';
  }

  getOrderStatusLabel(status: any): string {
    const value = Number(status);
    if (value === 0) return 'Chờ xác nhận';
    if (value === 1) return 'Đã xác nhận';
    if (value === 2) return 'Đang giao';
    return 'Hoàn thành';
  }

  getAvatarInitial(): string {
    const fullName = this.user?.full_name?.trim();
    return fullName ? fullName.charAt(0).toUpperCase() : 'U';
  }

  private extractUserFromResponse(res: any): IUser | null {
    if (!res) return null;

    const data = res.data || res.user || res.profile || res;
    
    if (!data || !data.email) return null;

    return {
      id: Number(data.id || 0),
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      role: data.role || 'user',
      active: String(data.active || '1'),
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    };
  }

  private getFallbackUserFromToken(): IUser | null {
    const payload = this.authService.getTokenPayload();
    if (!payload) return null;

    return {
      id: 0,
      full_name: payload.full_name || 'Người dùng',
      email: payload.email || '',
      role: payload.role || 'user',
      active: '1',
      createdAt: '',
      updatedAt: '',
    };
  }
}