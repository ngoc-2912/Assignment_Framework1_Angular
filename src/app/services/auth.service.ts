import { Injectable } from '@angular/core';
import axios from 'axios';
import { API_URL } from '../../environment/environment';
import { API_ENDPOINT } from '../config/end-point.config';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: number;
  full_name: string;
  role: string;
  email: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // ================= AUTH API =================
  login(form: any) {
    return axios.post(API_URL + API_ENDPOINT.auth.login, {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
  }

  register(form: any) {
    return axios.post(API_URL + API_ENDPOINT.auth.register, {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
  }

  registerAdmin(form: any) {
    const token = this.getToken();

    return axios.post(
      API_URL + '/users/admin-register',
      {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      },
      {
        headers: { Authorization: 'Bearer ' + token },
      },
    );
  }

  checkEmailExists(email: string) {
    return axios.post(API_URL + API_ENDPOINT.auth.checkEmail, {
      email: email.trim().toLowerCase(),
    });
  }

  // ================= TOKEN =================
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  // ================= DECODE TOKEN =================
  getTokenPayload(): TokenPayload | null {
    try {
      const token = this.getToken();
      return token ? jwtDecode<TokenPayload>(token) : null;
    } catch {
      return null;
    }
  }

  // ⭐ HÀM MÀ USER-DETAIL CẦN
  getCurrentUser() {
    const payload = this.getTokenPayload();
    if (!payload) return null;

    return {
      id: payload.id,
      full_name: payload.full_name,
      role: payload.role,
      email: payload.email,
    };
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}