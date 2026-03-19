import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shop-page',
  imports: [RouterLink],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage {}
