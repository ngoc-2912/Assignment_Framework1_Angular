import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, UiNotification],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  submitted = signal(false);
  message = signal('');
  messageType = signal('success');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      agree: [false, Validators.requiredTrue],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  async register() {
    this.submitted.set(true);

    await this.checkEmailDuplicate();

    if (this.registerForm.invalid) return;

    this.authService
      .register(this.registerForm.value)
      .then(() => {
        this.showMessage('Đăng ký thành công! Hãy đăng nhập', 'success');
        setTimeout(() => {
          this.router.navigate(['/login'], {
            state: { email: this.registerForm.value.email },
          });
        }, 3000);
      })
      .catch((err: any) => {
        this.showMessage(err.response?.data?.message || 'Đăng ký thất bại', 'danger');
      });
  }

  async checkEmailDuplicate() {
    const emailControl = this.f['email'];

    if (emailControl.hasError('required') || emailControl.hasError('email')) return;

    try {
      const res = await this.authService.checkEmailExists(emailControl.value);
      if (res.data.exists === true) {
        emailControl.setErrors({ duplicated: true });
      }
    } catch {}
  }

  showMessage(msg: string, type: 'success' | 'danger') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => {
      this.message.set('');
      this.messageType.set('');
    }, 3000);
  }
}
