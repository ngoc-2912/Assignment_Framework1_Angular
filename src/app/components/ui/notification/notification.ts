import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-ui-notification',
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiNotification {
  message = input('');
  type = input<'success' | 'danger' | 'warning' | 'info'>('success');
  dismissible = input(true);
  dismiss = output<void>();

  close() {
    this.dismiss.emit();
  }
}
