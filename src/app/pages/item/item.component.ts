import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import BlankComponent from "../../components/blank/blank.component";
import { FlexiGridModule, FlexiGridService, StateModel } from 'flexi-grid';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemModel } from '../../models/item.model';
import { HttpClient } from '@angular/common/http';
import { FlexiToastService } from 'flexi-toast';
import { lastValueFrom } from 'rxjs';
import { api } from '../../../constants';
import { ODataModel } from '../../models/odata.model';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ResultModel } from '../../models/result.model';

@Component({
  selector: 'app-item',
  imports: [RouterLink, FlexiGridModule, BlankComponent, CommonModule],
  templateUrl: './item.component.html'
})
export class ItemComponent {
  
   result = resource({
      request: () => this.state(),
      loader:async ()=> {
        let endpoint = `${api}/odata/items?$count=true`;
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
  
    constructor(){
      this.#breadcrumb.reset();
      this.#breadcrumb.add("Items", "/items",  "inventory_2")
    }
    dataStateChange(event: StateModel) {
        this.state.set(event);
      }
    
      delete(item: ItemModel) {
        const endpoint = `${api}/items/${item.id}`;    
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
