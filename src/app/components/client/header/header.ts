import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  readonly cartCount = this.cartService.totalItems;
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  logout(): void {
    this.authService.logout();
  }
}
