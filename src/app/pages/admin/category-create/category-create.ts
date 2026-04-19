import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Router, RouterLink } from '@angular/router';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-category-create',
  imports: [ReactiveFormsModule, RouterLink, UiNotification],
  templateUrl: './category-create.html',
  styleUrl: './category-create.scss',
})
export class CategoryCreate {
  submitted = signal(false);
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  nameError = signal('');
  createForm!: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
  ) {
    this.createForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      description: new FormControl(''),
      status: new FormControl('1'),
    });
  }

  get f() {
    return this.createForm.controls;
  }

  addCategory = async () => {
    this.submitted.set(true);
    this.nameError.set('');
    if (this.createForm.invalid) {
      return;
    }

    try {
      const resuilt = await this.categoryService.add(this.createForm.value);
      console.log(resuilt);
      this.message.set('Thêm danh mục thành công!');
      this.messageType.set('success');
      setTimeout(() => {
        this.router.navigate(['/admin/categories']);
      }, 3000);
    } catch (error) {
      const msg = (error as any).response?.data?.message;
      if (msg === 'Tên danh mục đã tồn tại') {
        this.nameError.set(msg);
      } else {
        this.message.set('Thêm danh mục thất bại!');
        this.messageType.set('danger');
      }
    }
  };
}
