import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DrawerStackComponent } from '@/app/components/drawer-stack/drawer-stack.component';
import { BackdropComponent } from '@/app/components/drawer/components/backdrop/backdrop.component';
import { NavbarComponent } from '@/app/components/navbar/navbar.component';
import { SelectionService, UserSettingsService } from '@/app/services';
import { searchInputStore } from '@/app/stores/search-input.store';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, BackdropComponent, DrawerStackComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() public q: string | undefined;

  protected readonly selection = inject(SelectionService);

  private readonly userSettingsService = inject(UserSettingsService);

  ngOnInit(): void {
    // TODO: FUTURE: Improve first load of user settings
    this.userSettingsService.getUserSettings();
    searchInputStore.set(this.q ?? '');
  }

  ngOnDestroy(): void {
    searchInputStore.set('');
  }
}
