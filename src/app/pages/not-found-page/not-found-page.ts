import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {
  message = history.state?.message || '';
    linkUrl = history.state?.linkUrl || '/';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.message = nav?.extras?.state?.['message'] ?? '';
    this.linkUrl = nav?.extras?.state?.['linkUrl'] ?? '/';
  }
}
