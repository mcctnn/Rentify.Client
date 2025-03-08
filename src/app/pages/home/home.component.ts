import {  Component, inject  } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import BlankComponent from '../../components/blank/blank.component';

@Component({
  imports: [BlankComponent],
  templateUrl: './home.component.html'
})
export default class HomeComponent {
  #breadcrumb = inject(BreadcrumbService);

  constructor(){
    this.#breadcrumb.reset();
  }
}