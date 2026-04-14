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

  selectedFile!: File;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
  ) {
    this.createForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      price: new FormControl('', [
        Validators.required,
        Validators.min(1000),
        Validators.pattern('^[0-9]+$')
      ]),
      image: new FormControl(''),
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
      console.log('CATEGORIES:', res);

      if (res && res.data) {
        this.categories.set(res.data);
      }
    } catch (err) {
      console.error(err);
      this.message.set('Không thể tải danh sách danh mục!');
      this.messageType.set('danger');
    }
  };

  // ✅ FIX: đảm bảo nhận file
  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log('FILE CHỌN:', file);

    if (file) {
      this.selectedFile = file;
    }
  }

  // ✅ FIX: upload có check lỗi
  async uploadImage() {
    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('upload_preset', 'angular_upload');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/djiddcpul/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      console.log('CLOUDINARY:', data);

      if (!data.secure_url) {
        throw new Error('Upload ảnh thất bại');
      }

      return data.secure_url;
    } catch (err) {
      console.error('UPLOAD ERROR:', err);
      this.message.set('Upload ảnh thất bại!');
      this.messageType.set('danger');
      throw err;
    }
  }

  addProduct = async () => {
    this.submitted.set(true);

    console.log('FORM:', this.createForm.value);
    console.log('FILE:', this.selectedFile);

    if (this.createForm.invalid || !this.selectedFile) {
      this.message.set('Vui lòng nhập đủ thông tin và chọn ảnh!');
      this.messageType.set('danger');
      return;
    }

    try {
      const imageUrl = await this.uploadImage();
      console.log('IMAGE URL:', imageUrl);

      const data = {
        ...this.createForm.value,
        image: imageUrl,
      };

      console.log('DATA GỬI API:', data);

      await this.productService.add(data);

      this.message.set('Thêm sản phẩm thành công!');
      this.messageType.set('success');

      setTimeout(() => {
        this.router.navigate(['/admin/products']);
      }, 2000);

    } catch (error) {
      console.error('ADD ERROR:', error);

      const msg = (error as any)?.response?.data?.message;
      if (msg === 'Tên sản phẩm đã tồn tại') {
        this.nameError.set(msg);
      } else {
        this.message.set('Thêm sản phẩm thất bại!');
        this.messageType.set('danger');
      }
    }
  };
}