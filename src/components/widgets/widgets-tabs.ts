import { NgComponentOutlet } from "@angular/common";
import { Component, signal, Type } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

import { BookmarksComponent, CollectionsComponent, RecentSearchesComponent, SavedSearchesComponent } from "@sinequa/atomic-angular";
import {
  BookmarkIcon,
  HistoryIcon,
  InboxIcon,
  Separator,
  StarIcon,
  TabComponent,
  TabContent,
  TabsComponent,
  TabsListComponent,
  TooltipDirective
} from "@sinequa/ui";

type HomeTab = {
  name: string;
  icon: Type<unknown>;
  label: string;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  disabled?: boolean;
};

const homeFeatures: HomeTab[] = [
  {
    name: "recentSearches",
    icon: HistoryIcon,
    label: "searches.recent.label",
    inputs: { options: { itemsPerPage: 5 } },
    component: RecentSearchesComponent
  },
  {
    name: "savedSearches",
    icon: StarIcon,
    label: "searches.saved.label",
    inputs: { options: { itemsPerPage: 5 } },
    component: SavedSearchesComponent
  },
  {
    name: "bookmarks",
    icon: BookmarkIcon,
    label: "bookmarks.label",
    inputs: { options: { itemsPerPage: 5 } },
    component: BookmarksComponent
  },
  {
    name: "baskets",
    icon: InboxIcon,
    label: "collections.label",
    component: CollectionsComponent
  }
];

/**
 * Widgets tabs component
 *
 * Usage:
 * ```html
 * <widgets-tabs></widgets-tabs>
 * ```
 * This component displays tabs for various widgets such as recent searches,
 * saved searches, bookmarks, and collections. Each tab loads the corresponding
 * component dynamically.
 *
 */
@Component({
  selector: "widgets-tabs",
  imports: [NgComponentOutlet, TranslocoPipe, TabsComponent, TabsListComponent, TabComponent, TabContent, Separator, TooltipDirective],
  template: `
    <!-- Desktop view -->
    <Tabs class="hidden max-h-full grow flex-col overflow-hidden md:flex">
      <TabsList class="flex w-full font-semibold" role="tablist" aria-label="widgets tabs">
        @for (tab of tabs(); track tab.label) {
          @let label = tab.label | transloco;
          <Tab tooltip="{{ label }}" role="tab" [value]="tab.label" class="w-fit overflow-hidden" [attr.disabled]="tab.disabled ?? null" [active]="$first">
            <ng-container *ngComponentOutlet="tab.icon" />
            <span class="truncate">{{ label }}</span>
          </Tab>
        }
      </TabsList>

      <div class="scrollbar-thin my-2 overflow-y-auto">
        @for (tab of tabs(); track tab.label) {
          <TabContent [value]="tab.label">
            <ng-container *ngComponentOutlet="tab.component; inputs: tab.inputs" />
          </TabContent>
        }
      </div>

      <Separator />
    </Tabs>

    <!-- Mobile view can be added here in the future -->
    <div class="md:hidden">
      <!-- Mobile view content -->
      @for (tab of tabs(); track tab.label) {
        <label class="my-4 flex items-center gap-2 border-b pb-2 font-semibold">
          <span class="truncate">{{ tab.label | transloco }}</span>
        </label>
        <ng-container *ngComponentOutlet="tab.component; inputs: tab.inputs" />
      }
    </div>
  `
})
export class WidgetsTabsComponent {
  readonly tabs = signal(homeFeatures);
}
