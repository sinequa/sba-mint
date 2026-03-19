import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SidebarMenuButtonComponent, SidebarMenuComponent, SidebarMenuItemComponent, TooltipDirective } from "@sinequa/ui";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sidebar-menu>
      <sidebar-menu-item aria-label="Agent">
        <sidebar-menu-button class="text-lg" routerLink="/agent" routerLinkActive="active" #rla2="routerLinkActive" [attr.data-active]="rla2.isActive || null">
          <i tooltip="Agent" tooltip-position="right" class="fa-fw far fa-robot [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true"></i>
          <span class="text-sm" sr-only>Agent</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>
  `,
  imports: [SidebarMenuComponent, SidebarMenuItemComponent, SidebarMenuButtonComponent, TooltipDirective, RouterLink, RouterLinkActive],
  host: {
    class: "contents"
  }
})
export class SidebarGroupAgentComponent {}
