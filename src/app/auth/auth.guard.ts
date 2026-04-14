import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // tránh lỗi SSR
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem("token");

  // chưa login
  if (!token) {
    return router.createUrlTree(['/']);
  }

  try {
    const decoded: any = jwtDecode(token);

    // token không có hạn
    if (!decoded.exp) {
      localStorage.removeItem("token");
      return router.createUrlTree(['/']);
    }

    const now = Math.floor(Date.now() / 1000);

    // token hết hạn
    if (decoded.exp < now) {
      localStorage.removeItem("token");
      return router.createUrlTree(['/']);
    }

    // ⭐ CHECK ROLE ADMIN (QUAN TRỌNG)
    // role = "1" mới được vào admin
    if (decoded.role !== "1") {
      return router.createUrlTree(['/']);
    }

    // hợp lệ → cho vào admin
    return true;

  } catch {
    localStorage.removeItem("token");
    return router.createUrlTree(['/']);
  }

};