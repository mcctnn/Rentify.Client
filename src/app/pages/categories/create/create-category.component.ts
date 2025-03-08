import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-create-category',
  imports: [FormsModule,BlankComponent,FlexiStepperModule,FormValidateDirective],
  templateUrl: './create-category.component.html'
})
export class CreateCategoryComponent {
  data = signal<CategoryModel>(new CategoryModel());
  loading = signal<boolean>(false);

  #breadcrumb = inject(BreadcrumbService);
  #http = inject(HttpClient);
  #toast = inject(FlexiToastService);
  #location=inject(Location)

  constructor() {
    this.#breadcrumb.reset();
    this.#breadcrumb.add("Categories", "/categories", "package_2")
    this.#breadcrumb.add("Create", "/categories/create", "add")
  }

  save(form:NgForm){
    if(form.valid){
      const endpoint = `${api}/categories`;
      this.loading.set(true);
      this.#http.post<ResultModel<string>>(endpoint, this.data()).subscribe(res => {
        this.#toast.showToast("Başarılı",res.data!,"success");
        this.loading.set(false);
        this.#location.back();
      });
    }else{
      this.#toast.showToast("Uyarı","Zorunlu alanları doldurun","warning");
    }
  }
}
