import { SelectionService } from '@/app/services/selection.service';
import { UserSettingsService } from '@/app/services/user-settings.service';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerStackComponent } from '@mint/components/drawer-stack/drawer-stack.component';
import { BackdropComponent } from '@mint/components/drawer/components/backdrop/backdrop.component';
import { NavbarComponent } from '@mint/components/navbar/navbar.component';
import { searchInputStore } from '../../stores/search-input.store';

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
