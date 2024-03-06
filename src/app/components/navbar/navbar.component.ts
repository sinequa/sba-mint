import { FALLBACK_SEARCH_ROUTE, isASearchRoute } from '@/app/app.routes';
import { NavigationService } from '@/app/services/navigation.service';
import { SearchService } from '@/app/services/search.service';
import { searchInputStore } from '@/app/stores/search-input.store';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, ViewChild, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DrawerStackService } from '../drawer-stack/drawer-stack.service';
import { SearchInputComponent } from '../search-input/search-input.component';

type NavbarMenu = {
  label: string;
  iconClass: string;
};

type NavbarTab = {
  label: string;
  iconClass: string;
  routerLink: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, RouterModule, SearchInputComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  @ViewChild(SearchInputComponent, { static: true }) public readonly searchInput: SearchInputComponent;

  protected readonly menus: NavbarMenu[] = [
    { label: 'Recent queries', iconClass: 'far fa-clock-rotate-left' },
    { label: 'Bookmarks', iconClass: 'far fa-star' },
    { label: 'Saved queries', iconClass: 'far fa-bookmark' },
    { label: 'Applications', iconClass: 'far fa-grid-round-2' }
  ];

  protected readonly tabs: NavbarTab[] = [
    { label: 'all results', routerLink: '/search/all', iconClass: 'far fa-globe' },
    { label: 'people', routerLink: '/search/people', iconClass: 'far fa-circle-user' },
    { label: 'slides', routerLink: '/search/slides', iconClass: 'far fa-presentation-screen' },
    { label: 'matters', routerLink: '/search/matters', iconClass: 'far fa-briefcase' },
  ];

  protected readonly navigationService = inject(NavigationService);

  private readonly router = inject(Router);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly searchService = inject(SearchService);

  private readonly subscriptions = new Subscription();

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });

  constructor() {
    this.subscriptions.add(
      searchInputStore.next$.subscribe(text => {
        this.searchInput.setInput(text);
      })
    );
  }

  protected changeTab(tab: NavbarTab): void {
    this.drawerStack.closeAll();
    this.searchService.search([tab.routerLink]);
  }

  /**
   * Occurs when the search input is validated by the user
   * (e.g. by pressing enter or clicking on a search button)
   *
   * @param text The validated text
   */
  protected validated(text: string): void {
    console.log('validated', text);

    const commands = isASearchRoute(this.router.url) ? [] : [FALLBACK_SEARCH_ROUTE];

    searchInputStore.set(text);

    this.router.navigate(commands, { queryParams: { q: searchInputStore.state }, queryParamsHandling: 'merge' });
  }

  /**
   * Occurs when the search input is updated by the user
   * @param text The updated text
   */
  protected updated(text: string): void {
    console.log('updated', text);
  }

  /**
   * Occurs when the search input is updated by the user and debounced by the system
   * @param text The debounced text
   */
  protected debounced(text: string): void {
    console.log('debounced', text);
  }
}
