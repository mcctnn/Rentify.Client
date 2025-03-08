import { Component, inject, signal } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { ItemModel } from '../../../models/item.model';
import { HttpClient } from '@angular/common/http';
import { FlexiToastService } from 'flexi-toast';
import { CommonModule, Location } from '@angular/common';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { FormsModule, NgForm } from '@angular/forms';
import { api } from '../../../../constants';
import { ResultModel } from '../../../models/result.model';
import { FlexiStepperModule } from 'flexi-stepper';
import { FormValidateDirective } from 'form-validate-angular';
import BlankComponent from '../../../components/blank/blank.component';

@Component({
  selector: 'app-create-item',
  imports: [BlankComponent, FormsModule, FlexiStepperModule, FormValidateDirective, CommonModule],
  templateUrl: './create-item.component.html'
})
export class CreateItemComponent {
  data = signal<ItemModel>(new ItemModel());
  loading = signal<boolean>(false);
  categoryService = inject(CategoryService);
  categories = this.categoryService.categories;

  #breadcrumb = inject(BreadcrumbService);
  #http = inject(HttpClient);
  #toast = inject(FlexiToastService);
  #location = inject(Location);

  constructor() {
    this.#breadcrumb.reset();
    this.#breadcrumb.add("Items", "/items", "package_2");
    this.#breadcrumb.add("Create", "/items/create", "add");

    // Kategori listesini çekiyoruz
    this.categoryService.getCategories();
  }

  save(form: NgForm) {
    if (form.valid) {
      const endpoint = `${api}/items`; // Düzeltildi
      this.loading.set(true);
      this.#http.post<ResultModel<string>>(endpoint, this.data()).subscribe({
        next: (res) => {
          this.#toast.showToast("Başarılı", res.data!, "success");
          this.loading.set(false);
          this.#location.back();
        },
        error: (err) => {
          console.error("Ürün kaydedilirken hata oluştu:", err);
          this.loading.set(false);
          this.#toast.showToast("Hata", "Ürün kaydedilemedi", "error");
        }
      });
    } else {
      this.#toast.showToast("Uyarı", "Zorunlu alanları doldurun", "warning");
    }
  }
}
