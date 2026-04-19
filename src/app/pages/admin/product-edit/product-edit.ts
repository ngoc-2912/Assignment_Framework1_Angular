import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { ProductService } from '../../../services/product.service';
import { VariantService } from '../../../services/variant.service';
import { ICategory } from '../../../interfaces/category.interface';
import { IProduct } from '../../../entities/product';
import { UiNotification } from '../../../components/ui/notification/notification';

type VariantFormValue = {
  uid: string;
  id: number | null;
  name: string;
  sku: string;
  price: string;
  color: string;
  size: string;
  image: string;
  imageFile: File | null;
  imagePreview: string;
};

@Component({
  selector: 'app-product-edit',
  imports: [ReactiveFormsModule, RouterLink, UiNotification],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEdit implements OnInit {
  protected id = 0;
  submitted = signal(false);
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  nameError = signal('');
  categoryError = signal('');
  variantError = signal('');
  categories = signal<ICategory[]>([]);
  productImagePreview = signal('');
  isSaving = signal(false);
  isSavingVariant = signal<Record<string, boolean>>({});
  submittedVariants = signal<Record<string, boolean>>({});
  showVariantModal = signal(false);
  selectedVariantIndex = signal<number | null>(null);
  selectedVariantName = signal('');
  isDeletingVariant = signal(false);

  selectedFile: File | null = null;

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl('', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]),
    image: new FormControl('', [Validators.required]),
    category_id: new FormControl('', [Validators.required]),
    status: new FormControl('1'),
    short_description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    description: new FormControl('', [Validators.required, Validators.minLength(20)]),
    variants: new FormArray([]),
  });

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private variantService: VariantService,
    private categoryService: CategoryService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    Promise.all([
      this.loadCategories(),
      this.getById(),
    ]);
  }

  get f() {
    return this.editForm.controls;
  }

  get variantsArray() {
    return this.editForm.get('variants') as FormArray;
  }

  get variantControls(): FormGroup[] {
    return this.variantsArray.controls as FormGroup[];
  }

  private createUid() {
    return globalThis.crypto?.randomUUID?.() ?? `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private toIntegerString(value: unknown) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '';
    return Math.trunc(numericValue).toString();
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
      color: new FormControl(variant?.color ?? '', [Validators.required]),
      size: new FormControl(variant?.size ?? '', [Validators.required]),
      image: new FormControl(variant?.image ?? ''),
      imageFile: new FormControl<File | null>(variant?.imageFile ?? null),
      imagePreview: new FormControl(variant?.imagePreview ?? variant?.image ?? '', [Validators.required]),
    });
  }

  addVariant(variant?: Partial<VariantFormValue>) {
    this.variantsArray.push(this.buildVariantGroup(variant));
    this.cdr.markForCheck();
  }

  removeVariant(index: number) {
    this.variantsArray.removeAt(index);
    this.cdr.markForCheck();
  }

  openVariantDeleteModal(index: number) {
    const variantName = this.variantControls[index]?.get('name')?.value ?? '';
    this.selectedVariantIndex.set(index);
    this.selectedVariantName.set(String(variantName));
    this.showVariantModal.set(true);
  }

  cancelVariantDelete() {
    this.showVariantModal.set(false);
    this.selectedVariantIndex.set(null);
    this.selectedVariantName.set('');
  }

  async confirmVariantDelete() {
    const index = this.selectedVariantIndex();

    if (index === null) {
      this.cancelVariantDelete();
      return;
    }

    const variantId = Number(this.variantControls[index]?.get('id')?.value);
    this.isDeletingVariant.set(true);

    try {
      if (Number.isFinite(variantId) && variantId > 0) {
        await this.variantService.deleteVariant(variantId);
      }

      this.removeVariant(index);
      this.message.set('Xóa biến thể thành công!');
      this.messageType.set('success');
      this.cancelVariantDelete();
    } catch {
      this.message.set('Xóa biến thể thất bại. Vui lòng thử lại!');
      this.messageType.set('danger');
      this.cdr.markForCheck();
    } finally {
      this.isDeletingVariant.set(false);
    }
  }

  async saveVariant(index: number) {
    const control = this.variantControls[index];
    const uid = control?.get('uid')?.value;

    if (uid) {
      this.submittedVariants.update((state) => ({ ...state, [uid]: true }));
    }

    if (!control || control.invalid) {
      control?.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    const variant = control.getRawValue() as VariantFormValue;
  

    this.isSavingVariant.update((state) => ({ ...state, [uid]: true }));
    this.cdr.markForCheck();

    try {
      const image = await this.resolveVariantImage(variant);

      const payload = {
        product_id: this.id,
        name: variant.name.trim(),
        sku: variant.sku.trim() || null,
        price: Number(variant.price),
        image,
        color: variant.color.trim() || null,
        size: variant.size.trim() || null,
      };

      if (variant.id) {
        await this.variantService.editVariant(Number(variant.id), payload);
      } else {
        const res = await this.variantService.add(payload);
        const createdId = res?.data?.id ?? (res as any)?.variant?.id;

        if (createdId) {
          control.patchValue({ id: createdId });
        }
      }

      this.message.set(`Lưu biến thể "${variant.name}" thành công!`);
      this.messageType.set('success');
      this.cdr.markForCheck();
    } catch {
      this.message.set(`Lưu biến thể "${variant.name}" thất bại!`);
      this.messageType.set('danger');
      this.cdr.markForCheck();
    } finally {
      this.isSavingVariant.update((state) => ({ ...state, [uid]: false }));
      this.cdr.markForCheck();
    }
  }

  onVariantImageChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const variantGroup = this.variantControls[index];

    if (!variantGroup) return;

    variantGroup.patchValue({
      imageFile: file,
      imagePreview: file ? URL.createObjectURL(file) : variantGroup.get('image')?.value ?? '',
    });
    this.cdr.markForCheck();
  }

  loadCategories = async () => {
    try {
      const res = await this.categoryService.list();
      if (res?.data) {
        this.categories.set(res.data);
        this.categoryError.set('');
        this.cdr.markForCheck();
      }
    } catch {
      this.categoryError.set('Không thể tải danh sách danh mục!');
      this.cdr.markForCheck();
    }
  };

  private async loadVariants() {
    try {
      const res = await this.variantService.list();
      const productVariants = (res?.data ?? []).filter(
        (variant) => Number(variant.product_id) === this.id,
      );

      const formArray = this.variantsArray;
      formArray.clear();

      for (const variant of productVariants) {
        formArray.push(this.buildVariantGroup({
          id: variant.id,
          name: variant.name,
          sku: variant.sku ?? '',
          price: this.toIntegerString(variant.price),
          color: variant.color ?? '',
          size: variant.size ?? '',
          image: variant.image ?? '',
          imagePreview: variant.image ?? '',
          uid: `variant-${variant.id}`,
        }));
      }

      this.variantError.set('');
      this.cdr.markForCheck();
    } catch {
      this.variantError.set('Không thể tải danh sách biến thể!');
      this.cdr.markForCheck();
    }
  }

  async getById() {
    try {
      this.message.set('');

      if (!Number.isFinite(this.id) || this.id <= 0) {
        this.router.navigate(['/not-found'], {
          state: { message: 'Sản phẩm không tồn tại!', linkUrl: '/admin/products' },
        });
        return;
      }

      const [result] = await Promise.all([
        this.productService.getById(this.id),
        this.loadVariants(),
      ]);

      const product: IProduct = result.data;

      this.editForm.patchValue({
        name: product.name,
        price: this.toIntegerString(product.price),
        image: product.image,
        category_id: product.category_id.toString(),
        status: product.status.toString(),
        short_description: product.short_description ?? '',
        description: product.description ?? '',
      });

      this.productImagePreview.set(product.image);
      this.cdr.markForCheck();
    } catch (error) {
      const statusCode = (error as any)?.response?.status;

      if (statusCode === 404) {
        this.router.navigate(['/not-found'], {
          state: { message: 'Sản phẩm không tồn tại hoặc đã bị xóa!', linkUrl: '/admin/products' },
        });
      } else if (statusCode === 401 || statusCode === 403) {
        this.message.set('Bạn không có quyền truy cập sản phẩm này.');
      } else {
        this.message.set('Không tải được dữ liệu sản phẩm. Vui lòng thử lại!');
      }

      this.messageType.set('danger');
      this.cdr.markForCheck();
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.productImagePreview.set(file ? URL.createObjectURL(file) : this.editForm.value.image ?? '');
  }

  getImageUrl(image: string | null | undefined) {
    if (!image) return 'https://placehold.co/420x280?text=No+Image';
    return image.startsWith('http') || image.startsWith('blob:')
      ? image
      : `https://placehold.co/420x280?text=${encodeURIComponent(image)}`;
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

    if (!data.secure_url) throw new Error('Upload fail');

    return data.secure_url as string;
  }

  private async resolveVariantImage(variant: VariantFormValue) {
    if (variant.imageFile) return this.uploadImage(variant.imageFile);
    return variant.imagePreview.trim() || null;
  }

  editProduct = async () => {
    this.submitted.set(true);
    this.nameError.set('');

    if (this.editForm.invalid) {
      this.message.set('Vui lòng kiểm tra lại thông tin sản phẩm!');
      this.messageType.set('danger');
      return;
    }

    this.isSaving.set(true);

    try {
      let imageUrl = this.editForm.value.image;

      if (this.selectedFile) {
        imageUrl = await this.uploadImage(this.selectedFile);
      }

      const { variants: _variants, ...productData } = this.editForm.getRawValue();

      await this.productService.editProduct(this.id, {
        ...productData,
        image: imageUrl,
      });

      this.message.set('Cập nhật sản phẩm thành công!');
      this.messageType.set('success');

      setTimeout(() => {
        this.router.navigate(['/admin/products']);
      }, 1200);
    } catch (error) {
      const msg = (error as any)?.response?.data?.message ?? (error as Error).message;

      if (msg === 'Tên sản phẩm đã tồn tại') {
        this.nameError.set(msg);
      } else {
        this.message.set(msg || 'Chỉnh sửa sản phẩm thất bại!');
        this.messageType.set('danger');
      }
    } finally {
      this.isSaving.set(false);
    }
  };
}