import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserSession {
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'lab02_user';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly userSignal = signal<UserSession | null>(this.loadInitialUser());

  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => this.user() !== null);

  login(email: string, _password: string): void {
    const session: UserSession = {
      fullName: email.split('@')[0] || 'Khach hang',
      email,
    };

    this.userSignal.set(session);
    this.persist();
  }

  register(fullName: string, email: string, _password: string): void {
    this.userSignal.set({ fullName, email });
    this.persist();
  }

  logout(): void {
    this.userSignal.set(null);
    this.persist();
  }

  private loadInitialUser(): UserSession | null {
    if (!this.isBrowser) {
      return null;
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }

  private persist(): void {
    if (!this.isBrowser) {
      return;
    }

    const current = this.user();
    if (!current) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(current));
  }
}
