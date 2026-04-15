import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IUser } from '../../../interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  user: IUser | null = null;
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
    this.profileError = '';

    this.profileService.getProfile()
      .then((res: unknown) => {
        const mappedUser = this.extractUserFromResponse(res);

        if (mappedUser) {
          this.user = mappedUser;
          return;
        }

        this.user = this.getFallbackUserFromToken();
        this.profileError = 'Không đọc được dữ liệu hồ sơ từ backend.';
      })
      .catch(err => {
        console.log(err);
        this.user = this.getFallbackUserFromToken();
        this.profileError = 'Không thể tải hồ sơ. Vui lòng thử lại.';
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
        alert('Đổi mật khẩu thành công');
        this.formPassword = { oldPassword: '', newPassword: '' };
      })
      .catch(err => {
        console.log(err);
        alert('Đổi mật khẩu thất bại');
      });
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

  private extractUserFromResponse(res: unknown): IUser | null {
    if (!res || typeof res !== 'object') {
      return null;
    }

    const root = res as Record<string, unknown>;
    const possibleUser = root['data'] || root['user'] || root['profile'] || root;

    if (!possibleUser || typeof possibleUser !== 'object') {
      return null;
    }

    const data = possibleUser as Record<string, unknown>;
    const full_name = this.getStringValue(data['full_name']);
    const email = this.getStringValue(data['email']);

    if (!full_name || !email) {
      return null;
    }

    return {
      id: Number(data['id'] ?? 0),
      full_name,
      email,
      phone: this.getStringValue(data['phone']) || undefined,
      address: this.getStringValue(data['address']) || undefined,
      role: this.getStringValue(data['role']) || 'user',
      active: this.getStringValue(data['active']) || '1',
      createdAt: this.getStringValue(data['createdAt']) || '',
      updatedAt: this.getStringValue(data['updatedAt']) || '',
    };
  }

  private getFallbackUserFromToken(): IUser | null {
    const payload = this.authService.getTokenPayload();

    if (!payload?.full_name || !payload?.email) {
      return null;
    }

    return {
      id: 0,
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role || 'user',
      active: '1',
      createdAt: '',
      updatedAt: '',
    };
  }

  private getStringValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}