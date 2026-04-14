import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-admin.html',
  styleUrl: './register-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterAdmin implements OnInit {

  registerForm!: FormGroup;
  submitted = signal(false);
  message = signal('');
  messageType = signal<'success' | 'danger' | ''>('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  registerAdmin() {
    this.submitted.set(true);

    if (this.registerForm.invalid) return;

    this.authService.registerAdmin(this.registerForm.value)
      .then((res: any) => {

        this.messageType.set('success');
        this.message.set(res.data.message || 'Tạo admin thành công!');

        this.registerForm.reset();
        this.submitted.set(false);

        // tự ẩn sau 3s
        setTimeout(() => this.message.set(''), 3000);
      })
      .catch((err: any) => {
        this.messageType.set('danger');

        if (err.response?.data?.message) {
          this.message.set(err.response.data.message);
        } else {
          this.message.set('Tạo admin thất bại!');
        }
      });
  }
}