import { Component, computed, effect, inject, signal, untracked } from "@angular/core";
import { AssistantComponent } from "@components/assistant/assistant";
import { getState } from "@ngrx/signals";
import { CCApp, debug } from "@sinequa/atomic";
import { AppStore, QueryParamsStore, UserSettingsStore } from "@sinequa/atomic-angular";
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  ChevronRightIcon,
  cn,
  SparklesIcon,
  SpinnerIcon
} from "@sinequa/ui";

@Component({
  selector: "app-search-overview",
  imports: [
    ChevronRightIcon,
    CardContentComponent,
    AssistantComponent,
    CardComponent,
    CardHeaderComponent,
    SpinnerIcon,
    SparklesIcon
  ],
  template: `
    @if (allowAI()) {
      <div class="h-full [--height:350px]">
        <Card variant="ai" hover="no" class="mb-4 h-full border-none bg-linear-to-r from-ai-from/20 via-ai-via/20 to-ai-to/20 shadow-none">
          <CardHeader class="flex cursor-pointer items-center gap-1 px-0 text-base font-semibold text-ai-card-foreground" (click)="onAssistantCollapse()">
            <div class="flex size-8 items-center justify-center">
              @if (isStreaming()) {
                <SpinnerIcon class="animate-spin"></SpinnerIcon>
              } @else {
                <SparklesIcon></SparklesIcon>
              }
            </div>

            <h2>AI Overview</h2>

            <button
              variant="none"
              [class]="
                cn('ms-auto cursor-pointer [&_svg]:transition-transform [&_svg]:duration-150 [&_svg]:ease-in-out', !assistantCollapsed() && '[&_svg]:rotate-90')
              "
              aria-label="toggle assistant">
              <ChevronRightIcon />
            </button>
          </CardHeader>

          @if (showAssistant()) {
            <CardContent [class]="cn('h-full px-0', assistantCollapsed() && 'hidden')">
              <assistant
                [class.hidden]="assistantCollapsed()"
                [showAssistant]="showAssistant()"
                [instanceId]="instanceId()"
                (isStreaming)="isStreaming.set($event)" />
            </CardContent>
          }
        </Card>
      </div>
    }
  `
})
export class SearchOverviewComponent {
  cn = cn;

  protected readonly appStore = inject(AppStore);
  protected readonly appFeatures = this.appStore.general()?.features;
  protected readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);

  // the Assistant is expanded and visible by default
  protected readonly assistantCollapsed = signal<boolean>(true);
  protected readonly showAssistant = signal<boolean>(false);
  protected readonly isStreaming = signal<boolean>(false);

  readonly isBasket = computed(() => !!this.queryParamsStore.basket?.());

  /**
   * Assistant related properties
   */
  readonly instanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-search-results-assistant`;
    }
    return `search-results-assistant`;
  });
  readonly allowAI = computed(() => !this.isBasket() && this.appStore.isAssistantAllowed(this.instanceId()));

  constructor() {
    // Update the assistant collapsed state from the user settings
    effect(() => {
      debug("effect - 6. update assistant collapsed state from user settings");
      const { collapseAssistant } = getState(this.userSettingsStore);

      untracked(() => {
        if (collapseAssistant !== undefined) {
          this.assistantCollapsed.set(collapseAssistant);
          if (!this.showAssistant()) {
            this.showAssistant.set(!collapseAssistant);
          }
        }
      });
    });
  }

  /**
   * Switch the assistant collapsed status.
   */
  async onAssistantCollapse() {
    const collapsed = !this.assistantCollapsed();
    await this.userSettingsStore.updateAssistantCollapsed(collapsed);
    this.assistantCollapsed.set(collapsed);
  }
}
