import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { SavedChatsComponent } from '@sinequa/assistant/chat';
import { SpellingCorrectionMode } from '@sinequa/atomic';
import { AggregationComponent } from '@sinequa/atomic-angular';
import {
  BreakpointObserverService,
  ButtonComponent,
  cn,
  SheetService,
  SidebarGroupComponent,
  SidebarGroupContentComponent,
  SidebarGroupLabelComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarProviderComponent,
  SidebarService,
  SidebarTriggerComponent
} from '@sinequa/ui';
import { AssistantComponent } from '@components/assistant/assistant';
import { AssistantUploadComponent } from '@components/assistant/document-upload/assistant-upload.component';
import { SidebarMainComponent } from '@components/sidebar/sidebar';
import { OnRouteAttached } from '@config/custom-reuse-strategy';
import { injectAssistantLayout } from '../../../composables/inject-assistant-layout';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoPipe,
    AssistantComponent,
    SavedChatsComponent,
    AssistantUploadComponent,
    AggregationComponent,
    ButtonComponent,
    SidebarProviderComponent,
    SidebarMainComponent,
    SidebarTriggerComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    SidebarGroupContentComponent,
    SidebarMenuComponent,
    SidebarMenuButtonComponent
  ],
  providers: [SidebarService, SheetService, provideTranslocoScope('filters')],
  template: `
    <sidebar-provider [style.--sidebar-width]="'12rem'" [style.--sidebar-width-mobile]="'20rem'" [style.--sidebar-width-icon]="'3rem'">
      <main-sidebar triggerName="sidebar-assistant">
        <div class="grid h-[calc(100vh-1rem)] translate-x-0 grid-cols-1 overflow-hidden transition duration-300 ease-in-out md:grid-cols-[300px_1fr]">
          <div class="scrollbar-stable scrollbar-thin hidden h-full space-y-2 overflow-y-auto pt-2 pb-2 pl-2 md:block">
            <sidebar-trigger />

            <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
            @for (key of [layout.assistantKey()]; track key) {
              @if (layout.showSavedChats()) {
                <section class="border-foreground/10 h-56 max-h-56 rounded-2xl border p-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-muted-foreground pointer-events-none font-semibold">
                      <i class="far fa-comments me-1"></i>
                      {{ 'assistant.saved-chats' | transloco }}
                    </h3>
                    <button
                      variant="ghost"
                      size="icon"
                      [title]="'assistant.new-discussion' | transloco"
                      [attr.aria-label]="'assistant.new-discussion' | transloco"
                      (click)="layout.startNewChat()">
                      <i class="far fa-plus"></i>
                    </button>
                  </div>
                  <!-- height of the saved chat component is 100% of the parent's height - 2rem (padding)  -->
                  <sq-saved-chats-v3
                    class="block h-[calc(100%-2rem)] overflow-auto"
                    [instanceId]="layout.instanceId()"
                    (load)="layout.handleLoadSavedChat($event)">
                  </sq-saved-chats-v3>
                </section>
              }
            }
            <section>
              <Aggregation
                #treepath
                name="Sources"
                column="treepath"
                showFiltersCount
                [collapsible]="true"
                class="border-foreground/10 rounded-2xl border p-4" />
            </section>
            <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
            @for (key of [layout.assistantKey()]; track key) {
              @if (layout.showDocumentUploader()) {
                <assistant-upload [instanceId]="layout.instanceId()" />
              }
            }
          </div>
          @if (layout.query()) {
            <div class="overflow-hidden">
              <sidebar-trigger class="mt-2 ml-1 md:hidden" />

              <Assistant
                class="inline"
                [query]="layout.query()"
                [instanceId]="layout.instanceId()"
                (onReady)="layout.handleReady($event)"
                (onConnection)="layout.handleConnection($event)" />
            </div>
          }
        </div>

        @let isMobile = breakpointObserverService.isMobile();
        @if (isMobile) {
          <sidebar-group slot="sidebar-extras">
            <sidebar-group-label>Assistant</sidebar-group-label>
            <sidebar-group-content>
              <sidebar-menu>
                <sidebar-menu-button (click)="layout.startNewChat(); sheetService.toggle()">
                  <i class="far fa-plus"></i>
                  <span sr-only>{{ 'assistant.new-discussion' | transloco }}</span>
                </sidebar-menu-button>
              </sidebar-menu>
            </sidebar-group-content>
          </sidebar-group>
        }
      </main-sidebar>
    </sidebar-provider>
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
export class AssistantLayoutComponent implements OnRouteAttached {
  readonly cn = cn;
  readonly chat = viewChild(AssistantComponent);

  readonly breakpointObserverService = inject(BreakpointObserverService);
  readonly sidebarService = inject(SidebarService);
  readonly sheetService = inject(SheetService);

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

  onRouteAttached() {
    this.layout.onRouteAttached();
  }
}
