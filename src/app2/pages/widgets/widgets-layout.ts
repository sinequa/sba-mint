import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { SidebarProviderComponent, SidebarTriggerComponent } from '@sinequa/ui';
import { SidebarMainComponent } from '../../../components/sidebar2/sidebar';
import { WidgetsSidebarGroupComponent } from '../../../components/widgets/widgets-sidebar-group';

@Component({
  selector: 'widgets-layout',
  imports: [RouterOutlet, SidebarMainComponent, SidebarTriggerComponent, SidebarProviderComponent, WidgetsSidebarGroupComponent],
  template: `
    <sidebar-provider>
      <main-sidebar triggerName="sidebar-search">
        <!-- sidebar extras -->
        <widgets-sidebar-group slot="sidebar-extras" />

        <!-- sidebar-inset content -->
        <nav class="bg-background sticky top-0 z-2 flex items-center justify-between gap-4 rounded p-4">
          <sidebar-trigger />
        </nav>
        <div class="sm:m-auto sm:w-[70%]">
          <div class="mx-2 flex flex-col">
            <router-outlet />
          </div>
        </div>
      </main-sidebar>
    </sidebar-provider>
  `,
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections', 'alerts', 'sort-selector', 'article')]
})
export class WidgetsLayout2Component {}
