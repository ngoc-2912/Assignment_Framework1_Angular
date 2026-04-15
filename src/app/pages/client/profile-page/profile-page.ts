import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {

  user: any = null;   // ✅ FIX: không để {}

  orders: any[] = [];

  formPassword = {
    oldPassword: '',
    newPassword: ''
  };

activeTab: 'welcome' | 'profile' | 'orders' | 'password' = 'welcome';

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.activeTab = 'welcome';

    this.loadProfile();
    this.loadOrders();
  }

  setTab(tab: 'profile' | 'orders' | 'password') {
    this.activeTab = tab;
  }

  loadProfile() {
    this.profileService.getProfile()
      .then((res: any) => {
        console.log('PROFILE:', res);

        // 🔥 FIX QUAN TRỌNG NHẤT
        this.user = res?.data ? { ...res.data } : null;
      })
      .catch(err => {
        console.log(err);
        this.user = null;
      });
  }

  loadOrders() {
    this.profileService.getOrders()
      .then((res: any) => {
        this.orders = res?.data || [];
      })
      .catch(err => {
        console.log(err);
        this.orders = [];
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
}