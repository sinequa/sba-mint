import { Component, computed, effect, inject, model, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslocoPipe } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";
import { Article, CCApp, PreviewData, Query } from "@sinequa/atomic";
import { AdvancedSearch, AppStore, CConverter, PreviewService, SelectionStore } from "@sinequa/atomic-angular";
import {
  ButtonComponent,
  ChevronLeftIconComponent,
  ChevronRightIcon,
  DialogComponent,
  DialogContentComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  Separator,
  TabComponent,
  TabsComponent,
  TabsListComponent
} from "@sinequa/ui";
import { AssistantComponent } from "../../assistant/assistant";
import { PreviewContentComponent } from "../preview-content/preview-content";

/**
 * Preview dialog component
 *
 * Usage:
 * ```html
 * <preview-dialog></preview-dialog>
 * ```
 * This component provides a dialog interface for previewing articles.
 * It includes tabs for chat, summary, and find functionalities,
 * and integrates with the assistant feature for enhanced user interaction.
 *
 */
@Component({
  selector: "preview-dialog, PreviewDialog, previewdialog",
  imports: [
    ButtonComponent,
    DialogComponent,
    DialogContentComponent,
    DialogTitleComponent,
    DialogHeaderComponent,
    PreviewContentComponent,
    TabsComponent,
    TabComponent,
    TranslocoPipe,
    AssistantComponent,
    AdvancedSearch,
    ChevronRightIcon,
    ChevronLeftIconComponent,
    Separator,
    TabsListComponent,
    FormsModule
  ],
  providers: [PreviewService],
  templateUrl: "./preview-dialog.html",
  host: {
    "(keydown.escape)": "$event.stopImmediatePropagation(); dialog()?.close()"
  }
})
export class PreviewDialogComponent {
  protected readonly appStore = inject(AppStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewService = inject(PreviewService);
  protected readonly appFeatures = this.appStore.general()?.features;

  public readonly article = signal<Article | undefined>(undefined);
  public readonly activeTab = signal<"chat" | "summary" | "find">("chat");
  public readonly sidebarExpanded = signal<boolean>(true);

  // dialog reference for controlling the dialog's visibility and behavior
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || "_query";

  chatWithDocQuery: Query = {} as Query;
  miniPreviewQuery: Query = {} as Query;

  readonly chatWithDocIntanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-chatwithdoc-assistant`;
    } else {
      return "preview-chatwithdoc-assistant";
    }
  });

  readonly summarizeInstanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-summarize-assistant`;
    } else {
      return "preview-summarize-assistant";
    }
  });

  displaySummaryContent = computed(() => this.appStore.isAssistantAllowed(this.summarizeInstanceId()));
  displayChatWithDocContent = computed(() => this.appStore.isAssistantAllowed(this.chatWithDocIntanceId()));

  readonly previewData = signal<PreviewData | undefined>(undefined);
  previewMultiConversion = computed(() => this.appStore.general()?.features?.previewMultiConversion);

  /** List of all available converters matching with previewData.conversions and the config defined general.converters */
  currentConversionIndex = model<number>(-1);
  currentConversion = computed<CConverter | undefined>(() =>
    this.currentConversionIndex() === -1 ? undefined : this.converterOptions()[this.currentConversionIndex()]
  );
  converters = computed(() =>
    !this.previewData()?.conversions?.length
      ? undefined
      : this.appStore
          .general()
          ?.converters?.filter(
            converter =>
              converter.display && this.previewData()?.conversions?.some(c => c.converterName === converter.converter && c.format === converter.format)
          )
  );

  /** All options for the converters dropdown */
  converterOptions = computed(() => {
    // return undefined if the feature is disabled or that there are no available conversions
    if (!this.previewMultiConversion() || !this.converters()?.length) return [];

    const converters = this.converters();
    if (converters) {
      return (
        converters
          .map(converter => {
            converter.conversion = this.previewData()?.conversions?.find(c => c.converterName === converter.converter && c.format === converter.format);
            return converter;
          })
          // sort to have defaults first, then primaries, then others
          .sort((a, b) => ((a.default && !b.default) || (!a.default && !b.default && a.primary && !b.primary) ? -1 : 1))
      );
    }
    return [];
  });

  constructor() {
    effect(() => {
      if (this.activeTab() === "chat" && !this.displayChatWithDocContent()) {
        this.activeTab.set(this.displaySummaryContent() ? "summary" : "find");
      } else if (this.activeTab() === "summary" && !this.displaySummaryContent()) {
        this.activeTab.set("find");
      }
    });

    effect(() => {
      // setting the current conversion to the first conversion
      // (the conversions being sorted to be defaults then primaries first, the first element will always be the one to pick by default)
      if (this.previewMultiConversion() && this.converterOptions()?.length) {
        this.currentConversionIndex.set(0);
      }
    });
  }

  open(article: Article) {
    this.article.set(article);
    this.chatWithDocQuery = {
      name: this.appStore.getDefaultQuery()?.name || "_query",
      text: article.title,
      filters: { field: "id", value: article.id, operator: "eq" }
    };
    this.miniPreviewQuery = {
      name: this.appStore.getDefaultQuery()?.name || "_query",
      text: article.title,
      filters: { field: "id", value: article.id, operator: "eq" }
    };

    const dialog = this.dialog();
    if (dialog) {
      dialog.showModal();
    }
  }
}
