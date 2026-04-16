import { Component, computed, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AppStore } from "@sinequa/atomic-angular";
import { CommentIcon, SidebarMenuButtonComponent, SidebarMenuComponent, SidebarMenuItemComponent, TooltipDirective, useSidebar } from "@sinequa/ui";

@Component({
  selector: "app-sidebar-group-assistant",
  template: `
    @if(allowAI()) {
    <sidebar-menu>
      <sidebar-menu-item aria-label="Chats">
        <sidebar-menu-button
          [tooltip]="'chats' | transloco" tooltip-position="right"
          class="text-lg"
          routerLink="/assistant"
          routerLinkActive="active"
          #rlaAssistant="routerLinkActive"
          [attr.data-active]="rlaAssistant.isActive || null">
          <comment-icon aria-hidden="true" />
          <span class="text-sm" sr-only>{{ 'chats' | transloco }}</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>
    }
  `,
  imports: [
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent,
    RouterLink,
    RouterLinkActive,
    TooltipDirective,
    TranslocoPipe,
    CommentIcon
  ]
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
