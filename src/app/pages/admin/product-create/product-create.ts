import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { ProductService } from '../../../services/product.service';
import { ICategory } from '../../../interfaces/category.interface';

@Component({
  selector: 'app-product-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-create.html',
  styleUrl: './product-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreate implements OnInit {
  submitted = signal(false);
  message = signal('');
  messageType = signal('success');
  nameError = signal('');
  categories = signal<ICategory[]>([]);
  createForm!: FormGroup;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
  ) {
    this.createForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      price: new FormControl('', [Validators.required, Validators.min(1000), Validators.pattern('^[0-9]+$')]),
      image: new FormControl('', [Validators.required]),
      category_id: new FormControl('', [Validators.required]),
      status: new FormControl('1'),
      description: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  get f() {
    return this.createForm.controls;
  }

  loadCategories = async () => {
    try {
      const res = await this.categoryService.list();
      if (res && res.data) {
        this.categories.set(res.data);
      }
    } catch {
      this.message.set('Không thể tải danh sách danh mục!');
      this.messageType.set('danger');
    }
  };

  addProduct = async () => {
    this.submitted.set(true);

    if (this.createForm.invalid) {
      return;
    }

    try {
      await this.productService.add(this.createForm.value);
      this.message.set('Thêm sản phẩm thành công!');
      this.messageType.set('success');
      setTimeout(() => {
        this.router.navigate(['/admin/products']);
      }, 3000);
    } catch (error) {
      const msg = (error as any).response?.data?.message;
      if (msg === 'Tên sản phẩm đã tồn tại') {
        this.nameError.set(msg);
      } else {
        this.message.set('Thêm sản phẩm thất bại!');
        this.messageType.set('danger');
      }
    }
  };
}
