import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-checkout-page',
  imports: [],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {}
