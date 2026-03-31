import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";

@Component({
  selector: "widgets-layout",
  imports: [RouterOutlet, SheetPreviewerComponent],
  template: `
  <div class="sm:m-auto sm:w-[70%]">
    <div class="mx-2 flex flex-col">
      <router-outlet />
    </div>
  </div>
  <sheet-previewer />
  `,
  providers: [provideTranslocoScope("bookmarks", "searches", "collections", "alerts", "sort-selector", "article")]
})
export class WidgetsLayout2Component {}
