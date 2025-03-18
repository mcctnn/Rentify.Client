import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FlexiToastService } from 'flexi-toast';
import { api } from '../../../../constants';
import { ResultModel } from '../../../models/result.model';
import { BreadcrumbService } from '../../../services/breadcrumb.service';
import { Location } from '@angular/common';
import { CategoryModel } from '../../../models/category.model';
import BlankComponent from '../../../components/blank/blank.component';
import { FlexiStepperModule } from 'flexi-stepper';
import { FormValidateDirective } from 'form-validate-angular';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-category',
  imports: [FormsModule,BlankComponent,FlexiStepperModule,FormValidateDirective],
  templateUrl: './create-category.component.html'
})
export class CreateCategoryComponent {
  readonly id = signal<string>("");
    readonly pageTitle = computed(() => this.id() ? "Update Category" : "Create Category");
    readonly result = resource({
      request: () => this.id(),
      loader: async ({ request }) => {
        if (this.id()) {
          const res = await lastValueFrom(this.#http.get<ResultModel<CategoryModel>>(`${api}/categories/${this.id()}`));
          return res.data!;
        }
  
        return undefined;
      }
    });
    readonly data = linkedSignal(() => this.result.value() ?? new CategoryModel());
    readonly loading = linkedSignal(() => this.result.isLoading() ?? false);

  #breadcrumb = inject(BreadcrumbService);
  #http = inject(HttpClient);
  #toast = inject(FlexiToastService);
  #location=inject(Location)

  constructor() {
    this.#breadcrumb.reset();
    this.#breadcrumb.add("Categories", "/categories", "package_2")
    this.#breadcrumb.add("Create", "/categories/create", "add")
  }

  save(form: NgForm) {
    if (form.valid) {
      const endpoint = `${api}/categories`; 
      this.loading.set(true);
      if (this.id()) {
        this.#http.put<ResultModel<string>>(endpoint, this.data()).subscribe(res => {
          this.#toast.showToast("Başarılı", res.data!, "info");
          this.loading.set(false);
          this.#location.back();
        });
      }
      else {
        this.#http.post<ResultModel<string>>(endpoint, this.data()).subscribe({
          next: (res) => {
            this.#toast.showToast("Başarılı", res.data!, "success");
            this.loading.set(false);
            this.#location.back();
          },
          error: (err) => {
            console.error("Kategori kaydedilirken hata oluştu:", err);
            this.loading.set(false);
            this.#toast.showToast("Hata", "Kategori kaydedilemedi", "error");
          }
        });
      }
      
    } else {
      this.#toast.showToast("Uyarı", "Zorunlu alanları doldurun", "warning");
    }
  }
}
