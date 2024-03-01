import { NavigationService } from '@/app/services/navigation.service';
import { SearchService } from '@/app/services/search.service';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  private readonly drawerStack = inject(DrawerStackService);
  private readonly searchService = inject(SearchService);

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });

  protected search(tab: NavbarTab): void {
    this.drawerStack.closeAll();
    this.searchService.search([tab.routerLink]);
  }
}
