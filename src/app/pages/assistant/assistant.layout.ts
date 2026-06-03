import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { SavedChatsComponent } from '@sinequa/assistant/chat';
import { SpellingCorrectionMode } from '@sinequa/atomic';
import { AggregationComponent, ApplicationService, DrawerStackService } from '@sinequa/atomic-angular';
import { ButtonComponent, cn, PageHeaderComponent } from '@sinequa/ui';
import { AssistantComponent } from '../../components/assistant/assistant';
import { AssistantUploadComponent } from '../../../components/assistant/document-upload/assistant-upload.component';
import { OnRouteAttached } from '@config/custom-reuse-strategy';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
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
    PageHeaderComponent,
    NavbarComponent,
    ButtonComponent,
    AppSidebarComponent
  ],
  providers: [provideTranslocoScope('filters')],
  template: `
    <PageHeader>
      <app-navbar [showInput]="false" [showMenu]="false" class="layout-search py-4" />
    </PageHeader>

    <div
      [class]="
        cn(
          'mt-16 ml-18 grid h-[calc(100vh-4rem)] translate-x-0 grid-cols-1 overflow-hidden transition duration-300 ease-in-out md:grid-cols-[.65fr_1fr] lg:grid-cols-[25%_1fr]',
          opened() && '-translate-x-[25%] md:grid-cols-[25%_50%]'
        )
      ">
      <div [class]="cn('scrollbar-stable scrollbar-thin hidden h-full overflow-y-auto opacity-0 md:block', !opened() && 'p-4 opacity-100')">
        <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
        @for (key of [layout.assistantKey()]; track key) {
          @if (layout.showSavedChats()) {
            <section class="border-foreground/10 dark:bg-menu shadow' h-56 max-h-56 rounded-2xl border p-4">
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
              <sq-saved-chats-v3 class="block h-[calc(100%-2rem)] overflow-auto" [instanceId]="layout.instanceId()" (load)="layout.handleLoadSavedChat($event)">
              </sq-saved-chats-v3>
            </section>
          }
        }
        <section class="pt-6">
          <Aggregation
            #treepath
            name="Sources"
            column="treepath"
            showFiltersCount
            [collapsible]="true"
            class="border-foreground/10 dark:bg-menu rounded-2xl border p-4 shadow" />
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
          <Assistant
            class="inline"
            [query]="layout.query()"
            [instanceId]="layout.instanceId()"
            (onReady)="layout.handleReady($event)"
            (onConnection)="layout.handleConnection($event)" />
        </div>
      }
    </div>
    <app-sidebar class="fixed top-0 h-full" [backLevel]="backLevel" />
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

  readonly drawerStackService = inject(DrawerStackService);
  readonly opened = computed(() => this.drawerStackService.isOpened());
  // kept for app-sidebar binding; no longer tracked reactively
  readonly backLevel = 0;
  private readonly applicationService = inject(ApplicationService);

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

  constructor() {
    // Update the title when the drawer closes (app1-specific behaviour)
    effect(() => {
      if (!this.drawerStackService.isOpened()) {
        this.applicationService.setTitle('Assistant');
      }
    });
  }

  onRouteAttached() {
    this.layout.onRouteAttached();
  }
}
