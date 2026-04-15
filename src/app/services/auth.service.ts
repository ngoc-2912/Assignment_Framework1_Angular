import { Injectable } from '@angular/core';
import axios from 'axios';
import { API_URL } from '../../environment/environment';
import { API_ENDPOINT } from '../config/end-point.config';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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

  checkEmailExists(email: string) {
    return axios.post(API_URL + API_ENDPOINT.auth.checkEmail, {
      email: email.trim().toLowerCase(),
    });
  }

  getTokenPayload(): { full_name: string; role: string; email: string } | null {
    try {
      const token = localStorage.getItem('token');
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }

  registerAdmin(form: any) {
    const token = localStorage.getItem('token');

    return axios.post(
      API_URL + '/users/admin-register',
      {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
}
