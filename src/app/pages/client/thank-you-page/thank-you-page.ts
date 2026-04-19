import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-thank-you-page',
  imports: [RouterLink],
  templateUrl: './thank-you-page.html',
  styleUrl: './thank-you-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThankYouPage {
  orderId = signal('');
  amount = signal(0);

  formattedAmount = computed(() => `${this.amount().toLocaleString('vi-VN')} VND`);

  constructor(private route: ActivatedRoute) {
    const orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
    const amount = Number(this.route.snapshot.queryParamMap.get('amount') ?? 0);

    this.orderId.set(orderId);
    this.amount.set(Number.isFinite(amount) ? amount : 0);
  }
}
