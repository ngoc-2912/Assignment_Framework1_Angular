import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooter } from '../../components/client/footer/footer';
import { Header } from '../../components/client/header/header';

@Component({
  selector: 'app-client-layout',
  standalone: true, // 🔥 BẮT BUỘC
  imports: [RouterOutlet, Header, AppFooter],
  templateUrl: './client-layout.html',
  styleUrls: ['./client-layout.scss'], // 🔥 sửa lại
})
export class ClientLayout {}