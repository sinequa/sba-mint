import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AGENT_INSTANCE_ID } from "@sinequa/agent";
import { AppStore } from "@sinequa/atomic-angular";
import {
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  TooltipDirective,
  useSidebar
} from "@sinequa/ui";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if(allowAgent()) {
    <sidebar-menu>
      <sidebar-menu-item aria-label="Agent">
        <sidebar-menu-button class="text-lg" routerLink="/chat/new" routerLinkActive="active" #rla2="routerLinkActive" [attr.data-active]="rla2.isActive || null">
          <i tooltip="Agent" tooltip-position="right" class="fa-fw far fa-robot [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true"></i>
          <span class="text-sm" sr-only>Agent</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>
  }
  `,
  imports: [SidebarMenuComponent, SidebarMenuItemComponent, SidebarMenuButtonComponent, TooltipDirective, RouterLink, RouterLinkActive],
  host: {
    class: "contents"
  }
})
export class SidebarGroupAgentComponent {
  readonly sidebar = useSidebar();

  private readonly appStore = inject(AppStore);

  private readonly instanceId = inject(AGENT_INSTANCE_ID);
  protected readonly allowAgent = computed(() => {
    return !!this.appStore.isAgentAllowed(this.instanceId);
  });


}
