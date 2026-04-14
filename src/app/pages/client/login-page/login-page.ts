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
  errorMessage = signal('');
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  get f() {
    return this.loginForm.controls;
  }
  login() {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      alert("Vui lòng nhập đúng email và mật khẩu!");
      return;
    }

    this.authService
      .login(this.loginForm.value)
      .then((res: any) => {
        const token = res.data.token;

        // lưu token
        this.authService.saveToken(token);

        // ✅ alert đăng nhập thành công
        alert(res.data.messageAlert);

        // về trang chủ
        this.router.navigate(['/']);
      })
      .catch((err: any) => {

        // ✅ LẤY messageAlert từ backend
        if (err.response?.data?.messageAlert) {
          alert(err.response.data.messageAlert);
        } else {
          alert("Đăng nhập thất bại!");
        }

      });
  }
}
