import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AGENT_INSTANCE_ID } from "@sinequa/agent";
import { AppStore } from "@sinequa/atomic-angular";
import { RobotIcon, SidebarMenuButtonComponent, SidebarMenuComponent, SidebarMenuItemComponent, TooltipDirective } from "@sinequa/ui";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if(allowAgent()) {
    <sidebar-menu>
      @let agent = 'agent' | transloco;
      <sidebar-menu-item aria-label="agent">
        <sidebar-menu-button [tooltip]="agent" tooltip-position="right" class="text-lg" routerLink="/chat/new" routerLinkActive="active" #rla2="routerLinkActive" [attr.data-active]="rla2.isActive || null">
          <robot-icon aria-hidden="true" />
          <span class="text-sm" sr-only>{{ agent }}</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>
  }
  `,
  imports: [
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent,
    TooltipDirective,
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    RobotIcon
  ],
  host: {
    class: "contents"
  }
})
export class SidebarGroupAgentComponent {
  private readonly appStore = inject(AppStore);
  private readonly instanceId = inject(AGENT_INSTANCE_ID);

  protected readonly allowAgent = computed(() => {
    return !!this.appStore.isAgentAllowed(this.instanceId);
  });
}
