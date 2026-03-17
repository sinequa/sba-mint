import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";

@Component({
  selector: "widgets-layout",
  imports: [RouterOutlet],
  template: `
  <div class="sm:m-auto sm:w-[70%]">
    <div class="mx-2 flex flex-col">
      <router-outlet />
    </div>
  </div>
  `,
  providers: [provideTranslocoScope("bookmarks", "searches", "collections", "alerts", "sort-selector", "article")]
})
export class WidgetsLayout2Component {}
