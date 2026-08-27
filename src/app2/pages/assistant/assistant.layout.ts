import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, TemplateRef, viewChild } from "@angular/core";
import { AssistantComponent } from "@components/assistant/assistant";
import { AssistantUploadComponent } from "@components/assistant/document-upload/assistant-upload.component";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";
import { OnRouteAttached, OnRouteDetached } from "@config/custom-reuse-strategy";
import { provideTranslocoScope, TranslocoPipe } from "@jsverse/transloco";
import { HeaderExtrasService } from "@services/header-extras.service";
import { SavedChatsComponent } from "@sinequa/assistant/chat";
import { SpellingCorrectionMode } from "@sinequa/atomic";
import { AggregationComponent } from "@sinequa/atomic-angular";
import { BarsIcon, BreakpointObserverService, ButtonComponent, cn, IconButtonComponent, SheetService, SidebarService, XMarkIcon } from "@sinequa/ui";
import { injectAssistantLayout } from "../../../composables/inject-assistant-layout";
import { injectTabletBreakpoint } from "../../../composables/inject-tablet-breakpoint";

@Component({
  selector: "assistant-layout, AssistantLayout",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TranslocoPipe,
    AssistantComponent,
    SavedChatsComponent,
    AssistantUploadComponent,
    ButtonComponent,
    SheetPreviewerComponent,
    AggregationComponent,
    IconButtonComponent,
    BarsIcon,
    XMarkIcon
  ],
  providers: [SidebarService, SheetService, provideTranslocoScope("filters")],
  template: `
        <ng-template #localColumn>
          <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
          @for (key of [layout.assistantKey()]; track key) {
            @if (layout.showSavedChats()) {
              <section class="h-56 max-h-56 p-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-muted-foreground pointer-events-none font-semibold">
                    <i class="far fa-comments me-1"></i>
                    {{ 'assistant.saved-chats' | transloco }}
                  </h3>
                  <button
                    variant="none"
                    icon-button
                    [title]="'assistant.new-discussion' | transloco"
                    [attr.aria-label]="'assistant.new-discussion' | transloco"
                    (click)="layout.startNewChat()">
                    <i class="far fa-plus"></i>
                  </button>
                </div>
                <!-- height of the saved chat component is 100% of the parent's height - 2rem (padding)  -->
                <!-- Closes the floating drawer too: picking a chat should reveal it, not leave the drawer covering it. -->
                <sq-saved-chats-v3
                  class="block h-[calc(100%-2rem)] overflow-auto"
                  [instanceId]="layout.instanceId()"
                  (load)="layout.handleLoadSavedChat($event); closeSidebarColumn()">
                </sq-saved-chats-v3>
              </section>
            }
          }
          <section class="grow">
            <Aggregation #treepath name="Sources" column="treepath" showFiltersCount [collapsible]="true" class="p-4" />
          </section>
          <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
          @for (key of [layout.assistantKey()]; track key) {
            @if (layout.showDocumentUploader()) {
              <!-- Closes the floating drawer first: the upload dialog otherwise renders underneath it. -->
              <assistant-upload [instanceId]="layout.instanceId()" (onUploadDialogOpen)="closeSidebarColumn()" />
            }
          }
        </ng-template>

        <!-- Opens/closes the floating local-column drawer + starts a new chat. Reused inline (ipad
             range, 768-1023px) and injected into the global fixed mobile header via
             HeaderExtrasService (<768px — that header has no other extension point). Fades out
             while the drawer is open (its own close button takes over). -->
        <ng-template #panelButtons>
          <div
            class="flex items-center gap-1 transition-opacity duration-200"
            [class.opacity-0]="!sidebarCollapsed()"
            [class.pointer-events-none]="!sidebarCollapsed()"
            [inert]="!sidebarCollapsed()">
            <button
              variant="none"
              icon-button
              (click)="toggleSidebarColumn()"
              [title]="'assistant.panel' | transloco"
              [attr.aria-label]="'assistant.panel' | transloco">
              <bars-icon />
            </button>
            @if (layout.showSavedChats()) {
              <button
                variant="none"
                icon-button
                (click)="layout.startNewChat()"
                [title]="'assistant.new-discussion' | transloco"
                [attr.aria-label]="'assistant.new-discussion' | transloco">
                <i class="far fa-plus"></i>
              </button>
            }
          </div>
        </ng-template>

        <!-- max-md: the global fixed mobile header (app.component.html) reserves --mobile-header-height
             via padding-top on its wrapper; this height calc must subtract it too, or the page
             overflows by that much and becomes scrollable, pushing the chat input out of view. -->
        <div class="relative flex h-[calc(100vh-1rem)] overflow-hidden max-md:h-[calc(100vh-1rem-var(--mobile-header-height))]">
          @if (!tabletBreakpoint.isTabletOrMobile()) {
            <div class="scrollbar-stable scrollbar-thin flex h-full w-75 shrink-0 flex-col space-y-2 overflow-y-auto pt-2 pb-2 pl-2">
              <ng-container *ngTemplateOutlet="localColumn" />
            </div>
          }

          <div class="flex flex-1 flex-col overflow-hidden">
            @if (tabletBreakpoint.isTabletOrMobile() && !breakpointObserverService.isMobile()) {
              <!-- ipad range only (768-1023px): below 768px these same buttons are injected into
                   the global fixed mobile header instead (see the constructor's effect below). -->
              <div class="flex items-center gap-1 p-2">
                <ng-container *ngTemplateOutlet="panelButtons" />
              </div>
            }

            @if (layout.query()) {
              <!-- min-h-0: sq-chat-v3 sizes itself via height:100%, but a flex item's default
                   min-height:auto refuses to shrink below its own content height — without this,
                   it overflows the remaining space by exactly the button row's height above,
                   clipping its bottom (or, with a tall chat, its top instead). -->
              <Assistant
                class="inline min-h-0 flex-1"
                [query]="layout.query()"
                [instanceId]="layout.instanceId()"
                (onReady)="layout.handleReady($event)"
                (onConnection)="layout.handleConnection($event)" />
            }
          </div>

          @if (tabletBreakpoint.isTabletOrMobile()) {
            <!-- Floating, non-modal panel: collapsed by default on ipad widths. Unlike the /search
                 left filters drawer, it does NOT auto-close on mouseleave — this panel's contents
                 (saved chats, Sources filters, uploader) trigger reflows/reloads on click that can
                 shift the pointer out from under the cursor, spuriously firing mouseleave. Closes
                 only via the explicit close button. z-index uses --z-drawer (see chat-v3.css for
                 the matching --z-dropdown override on the chat's message actions). -->
            <aside
              class="absolute top-0 left-0 z-(--z-drawer) h-full w-[20rem] p-3 transition-transform duration-300 ease-out max-md:w-full"
              [class.-translate-x-full]="sidebarCollapsed()"
              [inert]="sidebarCollapsed()">
              <div class="flex h-full w-full flex-col gap-2 rounded-(--radius-3xl) border border-(--stroke-neutral-disabled) bg-(--bg-neutral-white) px-4 py-3 shadow-lg">
                <div class="flex items-center justify-between">
                  <span class="font-semibold">{{ 'assistant.workspace' | transloco }}</span>
                  <button variant="none" icon-button (click)="closeSidebarColumn()" [attr.aria-label]="'close' | transloco">
                    <xmark-icon />
                  </button>
                </div>
                <div class="flex flex-1 scrollbar-thin flex-col gap-2 overflow-y-auto">
                  <ng-container *ngTemplateOutlet="localColumn" />
                </div>
              </div>
            </aside>
          }
        </div>

    <sheet-previewer />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: var(--color-foreground);
      }
    `
  ]
})
export class AssistantLayoutComponent implements OnRouteAttached, OnRouteDetached {
  readonly cn = cn;
  readonly chat = viewChild(AssistantComponent);

  readonly breakpointObserverService = inject(BreakpointObserverService);
  readonly sidebarService = inject(SidebarService);
  private readonly headerExtras = inject(HeaderExtrasService);

  /** ipad-width override (768-1023px) of the local column (saved chats/Sources/uploader) into a
   * floating drawer — mirrors the /search left filters drawer (ES-30542). */
  protected readonly tabletBreakpoint = injectTabletBreakpoint();
  protected readonly sidebarCollapsed = signal(true);

  private readonly panelButtonsTemplate = viewChild<TemplateRef<unknown>>("panelButtons");

  readonly q = input<string>();
  readonly t = input<string>();
  readonly b = input<string>();
  readonly s = input<string>();
  readonly f = input<string>();
  readonly n = input<string>();
  readonly c = input<SpellingCorrectionMode>();

  protected readonly layout = injectAssistantLayout(this.chat, {
    q: this.q,
    t: this.t,
    b: this.b,
    s: this.s,
    f: this.f,
    n: this.n,
    c: this.c
  });

  constructor(destroyRef: DestroyRef) {
    // Project panelButtons into the global fixed mobile header (<768px) — the ipad range
    // (768-1023px) renders them inline instead (see the template), since that header is itself
    // md:hidden. Route reuse (`data: { reuse: true }`) detaches rather than destroys this
    // component when navigating away, which stops this effect from running — cleanup on that path
    // goes through onRouteDetached() instead (called synchronously by CustomReuseStrategy).
    effect(() => {
      const template = this.panelButtonsTemplate();
      if (!template) return;
      if (this.breakpointObserverService.isMobile()) {
        this.headerExtras.set(template);
      } else {
        this.headerExtras.clear(template);
      }
    });

    destroyRef.onDestroy(() => this.clearHeaderExtras());
  }

  onRouteAttached() {
    this.layout.onRouteAttached();
  }

  onRouteDetached(): void {
    this.clearHeaderExtras();
  }

  private clearHeaderExtras(): void {
    const template = this.panelButtonsTemplate();
    if (template) this.headerExtras.clear(template);
  }

  protected toggleSidebarColumn(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  protected closeSidebarColumn(): void {
    this.sidebarCollapsed.set(true);
  }
}
