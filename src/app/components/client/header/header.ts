import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class Header implements OnInit {
  fullName = signal('');
  isLoggedIn = signal(false);
  isAdmin = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.refreshAuthState();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.refreshAuthState();
      });
  }

  logout() {
    localStorage.removeItem('token');
    this.refreshAuthState();
    this.router.navigate(['/login']);
  }

  private refreshAuthState() {
    const payload = this.authService.getTokenPayload();

    this.isLoggedIn.set(!!payload);
    this.fullName.set(payload?.full_name ?? '');
    this.isAdmin.set(String(payload?.role ?? '') === '1');
  }

}
