import { Component, Input, inject } from '@angular/core';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';

export type PreviewNavbarConfig = {
  showOpenButton?: boolean;
  showSearchButton?: boolean;
}

const DEFAULT_CONFIG: PreviewNavbarConfig = {
  showOpenButton: true,
  showSearchButton: true
}

@Component({
  selector: 'app-preview-navbar',
  standalone: true,
  imports: [],
  templateUrl: './preview-navbar.component.html',
  styleUrl: './preview-navbar.component.scss'
})
export class PreviewNavbarComponent {
  @Input() public set config(config: PreviewNavbarConfig) {
    this.navConfig = { ...DEFAULT_CONFIG, ...config };
  }

  protected drawerStack = inject(DrawerStackService);

  protected navConfig: PreviewNavbarConfig = DEFAULT_CONFIG;
}
