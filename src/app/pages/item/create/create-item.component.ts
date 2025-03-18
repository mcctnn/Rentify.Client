import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
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
import { lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-item',
  imports: [BlankComponent, FormsModule, FlexiStepperModule, FormValidateDirective, CommonModule],
  templateUrl: './create-item.component.html'
})
export class CreateItemComponent {
  readonly id = signal<string>("");
  readonly pageTitle = computed(() => this.id() ? "Update Item" : "Create Item");
  readonly result = resource({
    request: () => this.id(),
    loader: async ({ request }) => {
      if (this.id()) {
        const res = await lastValueFrom(this.#http.get<ResultModel<ItemModel>>(`${api}/items/${this.id()}`));
        return res.data!;
      }

      return undefined;
    }
  });
  readonly data = linkedSignal(() => this.result.value() ?? new ItemModel());
  readonly loading = linkedSignal(() => this.result.isLoading() ?? false);
  categoryService = inject(CategoryService);
  categories = this.categoryService.categories;

  readonly #breadcrumb = inject(BreadcrumbService);
  readonly #http = inject(HttpClient);
  readonly #toast = inject(FlexiToastService);
  readonly #location = inject(Location);
  readonly #activated = inject(ActivatedRoute);

  selectedFile: File | null = null; // Seçilen resim dosyası

  constructor() {
    this.#breadcrumb.reset();
    this.#breadcrumb.add("Items", "/items", "package_2");

    // Kategori listesini çekiyoruz
    this.categoryService.getCategories();

    this.#activated.params.subscribe(res => {
      if (res["id"]) {
        this.id.set(res["id"]);
        this.#breadcrumb.add(this.id(), `/items/edit/${this.id()}`, "edit")
      }
      else {
        this.#breadcrumb.add("Create", "/items/create", "add");
      }
    })
  }

  // Resim dosyası seçildiğinde tetiklenir
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  // Resmi backend'e yükle
  async uploadImage(): Promise<void> {
    if (!this.selectedFile) {
      this.#toast.showToast("Uyarı", "Lütfen bir resim seçin!", "warning");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
  
    try {
      const response = await lastValueFrom(this.#http.post<ResultModel<string>>(`${api}/api/images`, formData));
      
      if (response.data) {
        this.data().itemImageUrl = response.data; // Resim URL'sini güncelle
        this.#toast.showToast("Başarılı", "Resim başarıyla yüklendi!", "success");
      } else {
        this.#toast.showToast("Hata", "Resim yüklenirken hata oluştu!", "error");
      }
    } catch (error) {
      console.error("Resim yüklenirken hata oluştu:", error);
      this.#toast.showToast("Hata", "Resim yüklenirken hata oluştu!", "error");
    }
  }
  

  // Formu kaydet
  // Güncellenmiş save() fonksiyonu
  save(form: NgForm) {
    if (form.valid) {
      if (!this.data().itemImageUrl) {
        this.#toast.showToast("Uyarı", "Lütfen bir resim yükleyin!", "warning");
        return;
      }

      const endpoint = `${api}/items`;
      this.loading.set(true);

      if (this.id()) {
        this.#http.put<ResultModel<string>>(endpoint, this.data()).subscribe(res => {
          this.#toast.showToast("Başarılı", res.data!, "info");
          this.loading.set(false);
          this.#location.back();
        });
      } else {
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
      }
    } else {
      this.#toast.showToast("Uyarı", "Zorunlu alanları doldurun", "warning");
    }
  }
}