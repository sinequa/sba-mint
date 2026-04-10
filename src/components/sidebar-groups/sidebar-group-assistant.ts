import { Component, computed, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AppStore } from "@sinequa/atomic-angular";
import { SidebarMenuButtonComponent, SidebarMenuComponent, SidebarMenuItemComponent, TooltipDirective, useSidebar } from "@sinequa/ui";

@Component({
  selector: "app-sidebar-group-assistant",
  template: `
    @if(allowAI()) {
    <sidebar-menu>
      <sidebar-menu-item aria-label="Chats">
        <sidebar-menu-button
          class="text-lg"
          routerLink="/assistant"
          routerLinkActive="active"
          #rlaAssistant="routerLinkActive"
          [attr.data-active]="rlaAssistant.isActive || null">
          <i [tooltip]="'chats' | transloco" tooltip-position="right" class="fa-fw far fa-comment [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true"></i>
          <span class="text-sm" sr-only>{{ 'chats' | transloco }}</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>
    }
  `,
  imports: [SidebarMenuComponent, SidebarMenuItemComponent, SidebarMenuButtonComponent, RouterLink, RouterLinkActive, TooltipDirective, TranslocoPipe]
})
export class SidebarGroupAssistantComponent {
  private readonly router = inject(Router);
  private readonly appStore = inject(AppStore);

  readonly sidebar = useSidebar();
  readonly isCollapsed = computed(() => this.sidebar.state() === "collapsed");

  readonly instanceId = signal("standalone-assistant");

  protected readonly allowAI = computed(() => {
    return !this.router.url.startsWith("/assistant") && !!this.appStore.isAssistantAllowed(this.instanceId());
  });

}
