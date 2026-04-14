import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { ProductService } from '../../../services/product.service';
import { ICategory } from '../../../interfaces/category.interface';
import { IProduct } from '../../../entities/product';

@Component({
  selector: 'app-product-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEdit implements OnInit {
  protected id = 0;
  submitted = signal(false);
  message = signal('');
  messageType = signal('success');
  nameError = signal('');
  categories = signal<ICategory[]>([]);

  selectedFile!: File; // 🔥 thêm

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl('', [Validators.required, Validators.min(1)]),
    image: new FormControl('', [Validators.required]),
    category_id: new FormControl('', [Validators.required]),
    status: new FormControl('1'),
    description: new FormControl(''),
  });

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadCategories();
    this.getById();
  }

  get f() {
    return this.editForm.controls;
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

  async getById() {
    try {
      const result = await this.productService.getById(this.id);
      const product: IProduct = result.data;

      this.editForm.patchValue({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        category_id: product.category_id.toString(),
        status: product.status.toString(),
        description: product.description ?? '',
      });

    } catch {
      this.message.set('Không thể tải thông tin sản phẩm!');
      this.messageType.set('danger');
    }
  }

  // 🔥 chọn file
  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log('FILE:', file);

    if (file) {
      this.selectedFile = file;
    }
  }

  // 🔥 upload cloudinary
  async uploadImage() {
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'angular_upload');

    const res: any = await fetch(
      'https://api.cloudinary.com/v1_1/djiddcpul/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    ).then((r) => r.json());

    console.log('CLOUDINARY:', res);

    if (!res.secure_url) {
      throw new Error('Upload fail');
    }

    return res.secure_url;
  }

  editProduct = async () => {
    this.submitted.set(true);

    if (this.editForm.invalid) return;

    try {
      let imageUrl = this.editForm.value.image;

      // 🔥 nếu có chọn ảnh mới → upload
      if (this.selectedFile) {
        imageUrl = await this.uploadImage();
      }

      const data = {
        ...this.editForm.value,
        image: imageUrl,
      };

      console.log('DATA UPDATE:', data);

      await this.productService.editProduct(this.id, data);

      this.message.set('Chỉnh sửa sản phẩm thành công!');
      this.messageType.set('success');

      setTimeout(() => {
        this.router.navigate(['/admin/products']);
      }, 2000);

    } catch (error) {
      console.error(error);

      const msg = (error as any).response?.data?.message;
      if (msg === 'Tên sản phẩm đã tồn tại') {
        this.nameError.set(msg);
      } else {
        this.message.set('Chỉnh sửa sản phẩm thất bại!');
        this.messageType.set('danger');
      }
    }
  };
}