import { Component, input } from '@angular/core';

@Component({
  selector: "app-blank",
  imports: [],
  templateUrl: './blank.component.html'
})
export default class BlankComponent {
  readonly pageTitle = input.required<string>();
}
