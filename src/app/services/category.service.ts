import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryModel } from '../models/category.model';
import { api } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  categories = signal<CategoryModel[]>([]); // Signal ile kategori verisi tutuluyor
  readonly #http = inject(HttpClient);

  getCategories() {
    const endpoint = `${api}/odata/categories?$count=true`;
    this.#http.get<{ value: CategoryModel[] }>(endpoint).subscribe({
      next: (response) => {
        this.categories.set(response.value); // Signal verisi güncelleniyor
      },
      error: (err) => {
        console.error("Kategori çekerken hata oluştu:", err);
      }
    });
  }
}
