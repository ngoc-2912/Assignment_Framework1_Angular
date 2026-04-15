import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ICategory } from '../../../interfaces/category.interface';

@Component({
  selector: 'app-category-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './category-edit.html',
  styleUrl: './category-edit.scss',
})
export class CategoryEdit {
  protected id: number = 0;
  submitted = signal(false);
  message = signal('');
  messageType = signal('success');
  nameError = signal('');
  category: ICategory | null = null;
  formData = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    status: new FormControl('1'),
    description: new FormControl(''),
  });

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router,
  ) {
    this.route.params.subscribe((params: any) => {
      this.id = Number(params.id);
    });
  }

  ngOnInit() {
    setTimeout(() => {
    this.getById();
    }, 0);
  }

  get f() {
    return this.formData.controls;
  }

  async getById() {
    try {
      const result = await this.categoryService.getById(this.id);
      this.category = result.data; 
      console.log(this.category);
      this.formData.patchValue({
        name: this.category?.name,
        description: this.category?.description,
        status: this.category?.status,
      });
    } catch {
      this.router.navigate(['/not-found'], { state: { message: 'Danh mục không tồn tại!', linkUrl: '/admin/categories' } });
    }
  }

  async editCategory() {
    this.submitted.set(true);

    if (this.formData.invalid) {
      return;
    }

    try {
      const result = await this.categoryService.editCategory(this.id, this.formData.value);
      console.log(result);
      this.message.set('Chỉnh sửa danh mục thành công!');
      this.messageType.set('success');
      setTimeout(() => {
        this.router.navigate(['/admin/categories']);
      }, 3000);
    } catch(error) {
      const msg = (error as any).response?.data?.message;
      if (msg === 'Tên danh mục đã tồn tại') {
        this.nameError.set(msg);
      } else {
        this.message.set('Thêm danh mục thất bại!');
        this.messageType.set('danger');
      }
    }
  }
}
