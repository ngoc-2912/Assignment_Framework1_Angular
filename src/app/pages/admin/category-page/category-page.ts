import { Component, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { ICategory } from '../../../interfaces/category.interface';
import { RouterLink } from '@angular/router';
import { UiNotification } from '../../../components/ui/notification/notification';

@Component({
  selector: 'app-category-page',
  imports: [RouterLink, UiNotification],
  templateUrl: './category-page.html',
  styleUrl: './category-page.scss',
})
export class CategoryPage implements OnInit {
  constructor(private categoryService: CategoryService) {}

  categories = signal<ICategory[]>([]);
  message = signal('');
  messageType = signal<'success' | 'danger'>('success');
  showModal = signal(false);
  selectedCategory = signal<ICategory | null>(null);

  ngOnInit(): void {
    setTimeout(() => {
      this.loadCategories();
    }, 0);
  }

  loadCategories = async () => {
    try {
      const res = await this.categoryService.list();
      if (res && res.data) {
        this.categories.set(res.data);
      }
      console.log(this.categories());
    } catch (err) {
      this.showMessage('Không thể tải danh sách danh mục!', 'danger');
      console.log('res:', err);
    }
  };

  selectCategory(category: ICategory) {
    this.selectedCategory.set(category);
    this.showModal.set(true);
  }

  confirmDelete() {
    const id = this.selectedCategory()?.id;
    if (!id) return;

    this.categoryService
      .deleteCategory(id)
      .then(() => {
        this.showModal.set(false);
        this.categories.update((list) => list.filter((c) => c.id !== id));
        this.showMessage('Xóa danh mục thành công!', 'success');
      })
      .catch(() => {
        this.showModal.set(false);
        this.showMessage('Xóa danh mục thất bại!', 'danger');
      });
  }

  showMessage(msg: string, type: 'success' | 'danger') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => {
      this.message.set('');
      this.messageType.set('success');
    }, 3000);
  }
}
