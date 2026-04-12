import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // tránh lỗi khi SSR
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return router.createUrlTree(['/']);
  }

  try {

    const decoded: any = jwtDecode(token);

    // nếu token không có exp
    if (!decoded.exp) {
      localStorage.removeItem("token");
      return router.createUrlTree(['/']);
    }

    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      localStorage.removeItem("token");
      return router.createUrlTree(['/']);
    }

    return true;

  } catch {

    localStorage.removeItem("token");

    return router.createUrlTree(['/']);

  }

};