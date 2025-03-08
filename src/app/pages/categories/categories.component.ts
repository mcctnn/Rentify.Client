import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import BlankComponent from '../../components/blank/blank.component';
import { CommonModule } from '@angular/common';
import { FlexiGridModule, FlexiGridService, StateModel } from 'flexi-grid';
import { api } from '../../../constants';
import { lastValueFrom } from 'rxjs';
import { ODataModel } from '../../models/odata.model';
import { HttpClient } from '@angular/common/http';
import { FlexiToastService } from 'flexi-toast';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { CategoryModel } from '../../models/category.model';
import { ResultModel } from '../../models/result.model';

@Component({
  imports: [RouterLink, FlexiGridModule, BlankComponent, CommonModule],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent {
  result = resource({
    request: () => this.state(),
    loader: async () => {
      let endpoint = `${api}/odata/categories?$count=true`;
      const odataEndpoint = this.#grid.getODataEndpoint(this.state());
      endpoint += "&" + odataEndpoint;
      var res = await lastValueFrom(this.#http.get<ODataModel<any[]>>(endpoint));

      return res;
    }
  });
  readonly data = computed(() => this.result.value()?.value ?? []);
  readonly total = computed(() => this.result.value()?.['@odata.count'] ?? 0);
  readonly loading = linkedSignal(() => this.result.isLoading());
  readonly state = signal<StateModel>(new StateModel());

  #http = inject(HttpClient);
  #grid = inject(FlexiGridService);
  #breadcrumb = inject(BreadcrumbService);
  #toast = inject(FlexiToastService);

  constructor() {
    this.#breadcrumb.reset();
    this.#breadcrumb.add("Categories", "/categories", "category")
  }

  dataStateChange(event: StateModel) {
    this.state.set(event);
  }

  delete(item: CategoryModel) {
    const endpoint = `${api}/categories/${item.id}`;
    this.loading.set(true);

    this.#http.delete<ResultModel<string>>(endpoint).subscribe({
      next: (res) => {
        console.log("Silme başarılı:", res);
        this.#toast.showToast("Bilgilendirme", res.data!, "info");
        this.result.reload();
      },
      error: (err) => {
        console.error("Silme hatası:", err);
        this.#toast.showToast("Hata", "Silme işlemi başarısız oldu!", "error");
      }
    });
  };
}

