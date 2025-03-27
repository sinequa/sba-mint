import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import {
  DrawerStackService,
  NavigationService,
  OverflowItemDirective,
  OverflowManagerDirective,
  OverflowStopDirective,
  QueryParamsStore,
  SyslangPipe
} from '@sinequa/atomic-angular';
import { ButtonComponent, TabComponent, TabsComponent, MenuComponent, MenuContentComponent, MenuItemComponent } from '@sinequa/ui';

type NavbarTab = {
  display: string;
  name: string;
  path: string;
  iconClass: string;
  routerLink: string;
  queryName?: string;
};

@Component({
  selector: 'navbar-tabs',
  standalone: true,
  template: `
    <div overflowManager class="relative col-span-2 col-start-2 row-start-2 flex" (count)="visibleTabCount.set($event)">
      <tabs class="w-full">
        @for (tab of tabs(); track $index) {
          <tab
            class="w-fit"
            value="{{ tab.display | syslang | transloco }}"
            overflowItem
            [attr.aria-selected]="(navigationService.path$ | async) === tab.name"
            [active]="(navigationService.path$ | async) === tab.name"
            [routerLink]="[tab.routerLink]"
            [queryParams]="{ queryName: tab.queryName, q: searchText(), t: tab.name, f: undefined, sort: undefined, id: undefined, page: undefined }"
            (click)="changeTab(tab)">
            @if (tab.iconClass) {
              <i class="fa-fw {{ tab.iconClass }} " aria-hidden="true"></i>
            }
            <span>{{ tab.display | syslang | transloco }}</span>
          </tab>
        }
      </tabs>

      @if (moreTabs().length > 0) {
        <Menu class="absolute top-1 right-0" overflowStop>
          <button variant="ghost" class="mb-1 truncate" aria-label="more tabs">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>

          <MenuContent class="z-500 w-fit" position="bottom-end">
            @for (tab of moreTabs(); track $index) {
              <MenuItem>
                <a
                  class="inline-block whitespace-nowrap first-letter:capitalize"
                  [routerLink]="[tab.routerLink]"
                  routerLinkActive="text-primary aria-selected:text-primary"
                  [queryParams]="{ queryName: tab.queryName, q: searchText(), t: tab.name, f: undefined, sort: undefined, id: undefined, page: undefined }"
                  [attr.aria-selected]="(navigationService.path$ | async) === tab.name"
                  [attr.aria-label]="tab.display | syslang | transloco"
                  (click)="changeTab(tab)">
                  <i class="fa-fw {{ tab.iconClass }} " aria-hidden="true"></i>
                  {{ tab.display | syslang | transloco }}
                </a>
              </MenuItem>
            }
          </MenuContent>
        </Menu>
      } @else {
        <div class="absolute right-0" overflowStop></div>
      }
    </div>
  `,
  imports: [
    RouterLink,
    AsyncPipe,
    TranslocoPipe,
    SyslangPipe,
    ButtonComponent,
    MenuComponent,
    MenuItemComponent,
    MenuContentComponent,
    TabsComponent,
    TabComponent,
    OverflowManagerDirective,
    OverflowItemDirective,
    OverflowStopDirective
  ]
})
export class NavbarTabsComponent {
  readonly router = inject(Router);
  private readonly drawerStack = inject(DrawerStackService);
  readonly drawerOpened = signal(false);
  protected readonly navigationService = inject(NavigationService);
  readonly queryParamsStore = inject(QueryParamsStore);

  searchText = computed(() => {
    const state = getState(this.queryParamsStore);
    return state.text || '';
  });

  readonly visibleTabCount = signal<number | undefined>(undefined);

  // create tabs from the search routes
  readonly tabs = computed(
    () =>
      this.router.config
        .find(item => item.path === 'search')
        ?.children?.filter(c => c.path !== '**')
        .map(
          child =>
            ({
              display: child.data?.['display'] || child.path,
              name: child.data?.['wsQueryTab'] || child.path,
              path: child.path,
              routerLink: `${child.path}`,
              iconClass: child.data?.['iconClass'],
              queryName: child.data?.['queryName']
            }) as NavbarTab
        ) ?? []
  );
  readonly moreTabs = computed(() => this.tabs().slice(this.visibleTabCount()));

  protected changeTab(tab: NavbarTab): void {
    // we use the routerlink to navigate, so just close the drawer and remove the id parameter from the query params
    this.drawerStack.closeAll();
  }

  constructor() {
    this.drawerStack.isOpened.pipe(takeUntilDestroyed()).subscribe(state => this.drawerOpened.set(state));
  }
}
