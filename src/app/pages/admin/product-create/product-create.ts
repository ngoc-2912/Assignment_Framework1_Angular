import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { ProductService } from '../../../services/product.service';
import { VariantService } from '../../../services/variant.service';
import { ICategory } from '../../../interfaces/category.interface';

type VariantFormValue = {
  uid: string;
  id: number | null;
  name: string;
  sku: string;
  price: string;
  image: string;
  imageFile: File | null;
  imagePreview: string;
};

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
  messageType = signal<'success' | 'danger'>('success');
  nameError = signal('');
  categories = signal<ICategory[]>([]);
  productImagePreview = signal('');
  isSaving = signal(false);

  selectedFile: File | null = null;

  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl('', [
      Validators.required,
      Validators.min(1000),
      Validators.pattern('^[0-9]+$'),
    ]),
    image: new FormControl(''),
    category_id: new FormControl('', [Validators.required]),
    status: new FormControl('1'),
    description: new FormControl(''),
    variants: new FormArray([]),
  });

  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private categoryService: CategoryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  get f() {
    return this.createForm.controls;
  }

  get variantsArray() {
    return this.createForm.get('variants') as FormArray;
  }

  get variantControls(): FormGroup[] {
    return this.variantsArray.controls as FormGroup[];
  }

  private createUid() {
    return globalThis.crypto?.randomUUID?.() ?? `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private buildVariantGroup(variant?: Partial<VariantFormValue>) {
    return new FormGroup({
      uid: new FormControl(variant?.uid ?? this.createUid()),
      id: new FormControl(variant?.id ?? null),
      name: new FormControl(variant?.name ?? '', [Validators.required, Validators.minLength(2)]),
      sku: new FormControl(variant?.sku ?? ''),
      price: new FormControl(variant?.price ?? '', [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9]+$'),
      ]),
      image: new FormControl(variant?.image ?? ''),
      imageFile: new FormControl<File | null>(variant?.imageFile ?? null),
      imagePreview: new FormControl(variant?.imagePreview ?? variant?.image ?? ''),
    });
  }

  addVariant() {
    this.variantsArray.push(this.buildVariantGroup());
  }

  removeVariant(index: number) {
    this.variantsArray.removeAt(index);
  }

  onVariantImageChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const variantGroup = this.variantControls[index];

    if (!variantGroup) {
      return;
    }

    variantGroup.patchValue({
      imageFile: file,
      imagePreview: file ? URL.createObjectURL(file) : '',
    });
  }

  loadCategories = async () => {
    try {
      const res = await this.categoryService.list();

      if (res?.data) {
        this.categories.set(res.data);
      }
    } catch {
      this.message.set('Không thể tải danh sách danh mục!');
      this.messageType.set('danger');
    }
  };

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
    this.productImagePreview.set(file ? URL.createObjectURL(file) : '');
  }

  private async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'angular_upload');

    const response = await fetch('https://api.cloudinary.com/v1_1/djiddcpul/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('Upload ảnh thất bại');
    }

    return data.secure_url as string;
  }

  private hasVariantData(value: VariantFormValue) {
    return [value.name, value.sku, value.price, value.imagePreview].some((field) => field.trim() !== '');
  }

  private async resolveVariantImage(variant: VariantFormValue) {
    if (variant.imageFile) {
      return this.uploadImage(variant.imageFile);
    }

    return variant.imagePreview.trim() || null;
  }

  private async buildVariantPayloads(productId: number) {
    const payloads: Array<{
      product_id: number;
      name: string;
      sku: string | null;
      price: number;
      image: string | null;
    }> = [];

    for (const control of this.variantControls) {
      const variant = control.getRawValue() as VariantFormValue;

      if (!this.hasVariantData(variant)) {
        continue;
      }

      payloads.push({
        product_id: productId,
        name: variant.name.trim(),
        sku: variant.sku.trim() || null,
        price: Number(variant.price),
        image: await this.resolveVariantImage(variant),
      });
    }

    return payloads;
  }

  addProduct = async () => {
    this.submitted.set(true);
    this.nameError.set('');
    let createdProductId = 0;

    if (this.createForm.invalid || !this.selectedFile) {
      this.message.set('Vui lòng nhập đủ thông tin và chọn ảnh!');
      this.messageType.set('danger');
      return;
    }

    if (this.variantControls.some((control) => control.invalid)) {
      this.message.set('Kiểm tra lại thông tin biến thể trước khi lưu!');
      this.messageType.set('danger');
      return;
    }

    this.isSaving.set(true);

    try {
      const imageUrl = await this.uploadImage(this.selectedFile);
      const { variants: _variants, ...productData } = this.createForm.getRawValue();
      const createdProduct: any = await this.productService.add({
        ...productData,
        image: imageUrl,
      });

      const productId = createdProduct?.data?.id ?? createdProduct?.product?.id ?? createdProduct?.id;

      if (!productId) {
        throw new Error('Không lấy được ID sản phẩm vừa tạo');
      }

      createdProductId = productId;

      const variantPayloads = await this.buildVariantPayloads(productId);

      for (const payload of variantPayloads) {
        await this.variantService.add(payload);
      }

      this.message.set('Thêm sản phẩm và biến thể thành công!');
      this.messageType.set('success');

      setTimeout(() => {
        this.router.navigate(['/admin/products']);
      }, 1200);
    } catch (error) {
      const msg = (error as any)?.response?.data?.message ?? (error as Error).message;

      if (msg === 'Tên sản phẩm đã tồn tại') {
        this.nameError.set(msg);
      } else if (createdProductId) {
        this.message.set('Đã tạo sản phẩm, nhưng lưu biến thể chưa hoàn tất. Đang mở màn chỉnh sửa để bạn tiếp tục.');
        this.messageType.set('danger');

        setTimeout(() => {
          this.router.navigate(['/admin/product-edit', createdProductId]);
        }, 1200);
      } else {
        this.message.set(msg || 'Thêm sản phẩm thất bại!');
        this.messageType.set('danger');
      }
    } finally {
      this.isSaving.set(false);
    }
  };
}