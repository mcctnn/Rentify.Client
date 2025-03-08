import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { DatePipe } from '@angular/common';

@Component({
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  providers:[DatePipe]
})
export default class LayoutComponent {
  breadcrumbs = computed(() => this.#breadcrumb.data());
  time = signal<string>("");

  #breadcrumb = inject(BreadcrumbService);
  #date = inject(DatePipe);

  constructor() {
    setInterval(() => {
      this.time.set(this.#date.transform(new Date(), "dd.MM.yyyy HH:mm:ss")!);
    }, 1000)
  }
}
