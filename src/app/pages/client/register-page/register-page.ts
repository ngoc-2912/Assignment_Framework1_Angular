import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;
  submitted = signal(false);
  errorMessage = signal('');

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
    });
  }

  register() {
    this.submitted.set(true);

    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value)
      .then(() => {
        alert('Đăng ký thành công! Hãy đăng nhập');
        this.router.navigate(['/login']);
      })
      .catch((err: any) => {
        this.errorMessage.set(err.response?.data?.message || 'Đăng ký thất bại');
      });
  }
}