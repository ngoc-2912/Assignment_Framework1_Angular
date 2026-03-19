import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router'; 

declare var $: any;

@Component({
  selector: 'app-product-page',
  imports: [RouterLink],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        $('#myTable').DataTable();
      }, 0);
    }
  }

}