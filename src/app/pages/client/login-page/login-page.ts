import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage implements OnInit {
  submitted = signal(false);
  message = signal('');
  messageType = signal('success');
  loginForm!: FormGroup;
  private prefillEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.prefillEmail = nav?.extras?.state?.['email'] ?? '';
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [this.prefillEmail, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  get f() {
    return this.loginForm.controls;
  }
  login() {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      return;
    }

    this.authService
      .login(this.loginForm.value)
      .then((res: any) => {
        const token = res.data.token;

        // lưu token
        this.authService.saveToken(token);

        this.showMessage('Đăng nhập thành công!', 'success');

        // về trang chủ
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      })
      .catch((err: any) => {
        if (err.response?.data?.messageAlert) {
          this.showMessage(err.response.data.messageAlert, 'danger');
        } else {
          this.showMessage('Đăng nhập thất bại!', 'danger');
        }
      });
  }
  showMessage(msg: string, type: 'success' | 'danger') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => {
      this.message.set('');
      this.messageType.set('');
    }, 5000);
  }
}
