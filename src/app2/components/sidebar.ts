import { Component, computed, effect, inject, linkedSignal, signal, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { SidebarGroupAgentComponent } from "@components/sidebar-groups/sidebar-group-agent";
import { SidebarGroupAgentHistoryComponent } from "@components/sidebar-groups/sidebar-group-agent-history";
import { SidebarGroupAssistantComponent } from "@components/sidebar-groups/sidebar-group-assistant";
import { SidebarGroupNavigationComponent } from "@components/sidebar-groups/sidebar-group-navigation";
import { SidebarUserMenuComponent } from "@components/sidebar-groups/sidebar-user-menu";
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { getHelpIndexUrl } from "@sinequa/atomic";
import {
  AppStore,
  OverrideUserDialogComponent,
  PrincipalStore,
  ResetUserSettingsDialogComponent,
  UserProfileDialog,
  UserProfileService
} from "@sinequa/atomic-angular";
import {
  AvatarComponent,
  AvatarFallbackComponent,
  AvatarImageComponent,
  GearIcon,
  MenuComponent,
  MenuContentComponent,
  QuestionCircleIcon,
  Sidebar,
  SidebarContentComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  SidebarTriggerComponent,
  TooltipDirective,
  UserIcon,
  useSidebar
} from "@sinequa/ui";
import { filter } from "rxjs";

@Component({
  selector: "app-sidebar",
  imports: [
    Sidebar,
    SidebarHeaderComponent,
    SidebarContentComponent,
    SidebarFooterComponent,
    SidebarMenuButtonComponent,
    SidebarTriggerComponent,
    AvatarComponent,
    AvatarFallbackComponent,
    MenuComponent,
    MenuContentComponent,
    TooltipDirective,
    SidebarGroupNavigationComponent,
    SidebarGroupAgentComponent,
    SidebarGroupAgentHistoryComponent,
    SidebarGroupAssistantComponent,
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarUserMenuComponent,
    UserProfileDialog,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    AvatarImageComponent,
    UserIcon,
    GearIcon,
    QuestionCircleIcon,
    TranslocoPipe
  ],
  template: `
    <sidebar collapsible="icon" class="border-none h-full">
      <sidebar-header class="px-3 pt-6">
        <div class="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div
            class="h-8 w-32 bg-contain bg-left bg-no-repeat group-data-[collapsible=icon]:hidden"
            style="background-image: var(--logo-sidebar)"></div>
          <div
            class="logo-collapse-container relative hidden size-8 items-center justify-center group-data-[collapsible=icon]:flex">
            <div
              class="logo-small size-8 bg-contain bg-center bg-no-repeat transition-opacity"
              style="background-image: var(--logo-small)"></div>
            <sidebar-trigger [tooltip]="'openSidebar' | transloco" tooltip-position="right" />
          </div>
          <sidebar-trigger
            [tooltip]="'closeSidebar' | transloco"
            tooltip-position="right"
            class="size-8 group-data-[collapsible=icon]:hidden" />
        </div>
      </sidebar-header>

      <sidebar-content>
        <!-- main navigation menu -->
        <app-sidebar-group-navigation>

        <!-- assistant menu -->
        <app-sidebar-group-assistant />

        <!-- agents and worksets menu -->
        <app-sidebar-group-agent />

        </app-sidebar-group-navigation>

        <!-- Agent saved-chats history: its own scroll region below the fixed navigation
             (only rendered on the agent route). -->
        <app-sidebar-group-agent-history />

      </sidebar-content>

      <sidebar-footer class="px-3 py-6">
        <sidebar-menu>
          @if (isAdminOrDelegatedAdmin()) {
            @let administration = ('administration' | transloco);
            <sidebar-menu-item [attr.aria-label]="administration" class="group-data-[collapsible=icon]:items-center" (click)="openAdmin()">
              <sidebar-menu-button class="text-lg" [tooltip]="isCollapsed() ? administration : ''" tooltip-position="right" >
                <gear-icon />
                <span class="text-sm">{{ administration }}</span>
              </sidebar-menu-button>
            </sidebar-menu-item>
          }
          @let help = ('help' | transloco);
          <sidebar-menu-item [attr.aria-label]="help" class="group-data-[collapsible=icon]:items-center" (click)="openHelp()">
            <sidebar-menu-button class="text-lg" [tooltip]="isCollapsed() ? help : ''" tooltip-position="right">
              <question-circle-icon />
              <span class="text-sm">{{ help }}</span>
            </sidebar-menu-button>
          </sidebar-menu-item>

        @if (isAdminOrDelegatedAdmin()) {
          <Menu>
          <sidebar-menu-item>
              <sidebar-menu-button [tooltip]="isCollapsed() ? fullname() || email() : ''" tooltip-position="right" size="lg" class="group/avatar">
                <Avatar class="size-8 dark:bg-sage-200 dark:text-sage-900 group-hover/avatar:bg-sage-300">
                  <AvatarImage [src]="profilePhoto()" width="44" height="44" alt="avatar" />
                  <AvatarFallback>
                    @if (initials()) {
                      <span>{{ initials() }}</span>
                    } @else {
                      <UserIcon />
                    }
                  </AvatarFallback>
                </Avatar>

                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{ fullname() }}</span>
                  <span class="truncate text-xs">{{ email() }}</span>
                </div>
              </sidebar-menu-button>

              <MenuContent position="top-end" class="border-menu-border bg-menu-bg rounded-3xl border p-3 shadow-lg min-w-max">
                <!-- <Settings class="mt-auto" [debug]="true" /> -->
                <sidebar-user-menu-content (onEventClick)="handleClick($event)" />
              </MenuContent>
            </sidebar-menu-item>
          </Menu>
        } @else {
          <sidebar-menu-item>
            <sidebar-menu-button [tooltip]="isCollapsed() ? fullname() || email() : ''" tooltip-position="right" size="lg">
              <Avatar class="size-8">
                  <AvatarImage [src]="profilePhoto()" width="44" height="44" alt="avatar" />
                  <AvatarFallback>
                    @if (initials()) {
                      <span>{{ initials() }}</span>
                    } @else {
                      <UserIcon />
                    }
                  </AvatarFallback>
              </Avatar>

              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ fullname() }}</span>
                <span class="truncate text-xs">{{ email() }}</span>
              </div>
            </sidebar-menu-button>
          </sidebar-menu-item>
        }
        </sidebar-menu>
      </sidebar-footer>

    </sidebar>

  <user-profile-dialog />
  <override-user-dialog />
  <reset-user-settings-dialog />

  `,
  providers: [provideTranslocoScope("bookmarks", "searches", "collections", "alerts", "sort-selector", "article", "filters")]
})
export class MainSidebarComponent {
  readonly userProfileDialog = viewChild(UserProfileDialog);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);
  private readonly transloco = inject(TranslocoService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly navigationEnd = toSignal(inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)));

  constructor() {
    effect(() => {
      this.navigationEnd();
      if (this.sidebar.isMobile()) {
        this.sidebar.setOpenMobile(false);
      }
    });
  }

  readonly principal = inject(PrincipalStore);
  readonly appStore = inject(AppStore);
  readonly sidebar = useSidebar();

  isAdminOrDelegatedAdmin = signal(true);

  readonly isCollapsed = computed(() => this.sidebar.state() === "collapsed");

  readonly email = computed(() => this.principal.email());
  readonly fullname = computed(() => (this.principal.fullName() ? this.principal.fullName() : this.principal.name()));

  readonly enabledUserProfile = computed(() => this.appStore.general()?.features?.userProfile?.enabled);
  protected userProfileResource = this.userProfileService.getUserProfile(!this.enabledUserProfile() ? signal(undefined) : this.principal.userId);
  readonly userProfile = linkedSignal(() => {
    if (this.userProfileResource.hasValue()) {
      return this.userProfileResource.value();
    }
    return undefined;
  });
  readonly profilePhoto = computed(() => this.userProfile()?.data.profilePhoto || "");
  readonly initials = computed(() => {
    const fullName = this.userProfile()?.data?.fullName;
    if (!fullName) return this.principal.initials();

    return fullName
      .split(" ")
      .map(word => word[0].toUpperCase())
      .join("");
  });

  openHelp() {
    const url = getHelpIndexUrl(this.transloco.getActiveLang(), {
      folder: "mint-search",
      path: "/r/_sinequa/webpackages/help",
      indexFile: "olh-index.html",
      useLocale: true,
      useLocaleAsPrefix: true
    });
    window.open(url, "_blank", "noopener");
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, "_blank", "noopener");
  }

  handleClick(e: string | undefined) {
    switch (e) {
      case "profile":
        this.userProfileDialog()?.open();
        break;
      case "reset-user-settings":
        this.resetUserSettingsDialog()?.open();
        break;
      case "override-user":
        this.overrideUserDialog()?.open();
        break;
      case "revert-override-user":
        this.overrideUserDialog()?.handleOverrideUser();
        break;
    }
  }
}
