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
  ) {}

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
      return;
    }

    this.authService
      .login(this.loginForm.value)
      .then((res: any) => {
        const token = res.data.token;
        console.log(res.data.token);

        this.authService.saveToken(token);
        this.router.navigate(['/']);
      })
      .catch((err: any) => {
        this.errorMessage.set('Sai email hoặc password');
      });
  }
}
