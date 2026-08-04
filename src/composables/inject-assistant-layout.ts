import { ChangeDetectorRef, computed, DestroyRef, effect, inject, Signal, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import type { AssistantComponent } from "@components/assistant/assistant";
import { TranslocoService } from "@jsverse/transloco";
import { HubConnection } from "@microsoft/signalr";
import { getState } from "@ngrx/signals";
import { SavedChat } from "@sinequa/assistant/chat";
import { CCApp, error, fetchQuery, globalConfig, Query, warn } from "@sinequa/atomic";
import { AggregationsStore, ApplicationService, AppStore, PrincipalStore, QueryParamsStore, SelectionStore } from "@sinequa/atomic-angular";
import { injectCurrentUrl } from "@utils/routing";
import { filter, firstValueFrom, skip, take } from "rxjs";
import { injectUrlQueryParamsSync, UrlQueryParamInputs } from "./url-query-params-sync";

// Minimal public API required from the assistant component
type AssistantRef = Pick<AssistantComponent, "newChat" | "askAI" | "sqChat">;

/**
 * Composable that encapsulates the shared logic of AssistantLayoutComponent
 * across app1 (legacy) and app2 (future).
 *
 * Handles: query sync, chat state persistence (localStorage), saved chat restore,
 * principal-change recreation, and aggregation initialization.
 *
 * @param chat  Signal returned by `viewChild(AssistantComponent)` in the host component.
 * @param inputs  URL query param input signals from the host component.
 */
export function injectAssistantLayout(chat: Signal<AssistantRef | undefined>, inputs: UrlQueryParamInputs) {
  const appStore = inject(AppStore);
  const aggregationStore = inject(AggregationsStore);
  const selectionStore = inject(SelectionStore);
  const queryParamsStore = inject(QueryParamsStore);
  const applicationService = inject(ApplicationService);
  const cdr = inject(ChangeDetectorRef);
  const destroyRef = inject(DestroyRef);
  const principalStore = inject(PrincipalStore);
  const transloco = inject(TranslocoService);
  const currentUrl = injectCurrentUrl();
  // Translated tab title via the service's selectTranslate — NOT the translateSignal helper, which
  // auto-injects this component's provideTranslocoScope ("filters") and would resolve the key in the
  // wrong namespace. selectTranslate waits for the async file (no raw-key flash) + re-emits on lang change.
  const pageTitle = toSignal(transloco.selectTranslate("pageTitle.assistant"));

  const STORAGE_KEY = "assistant_current_chat_id";
  const appFeatures = appStore.general()?.features;

  const query = signal<Query | undefined>(undefined);
  const connectionEstablished = signal(false);
  const isAssistantReady = signal(false);
  const assistantKey = signal(0);

  const instanceId = computed(() => {
    const { usePrefixName = false } = appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(appStore) as CCApp;
      return `${name}-standalone-assistant`;
    }
    return "standalone-assistant";
  });

  const showSavedChats = computed(() => {
    const allowSavedChats = Boolean(appStore.assistants()[instanceId()]?.["savedChatSettings"]?.["display"]);
    return allowSavedChats && connectionEstablished() && isAssistantReady();
  });

  const showDocumentUploader = computed(() => {
    const allowDocumentUploader = Boolean(appStore.customizationJson()?.["documentsUploadSettings"]?.["enabled"]);
    return allowDocumentUploader && connectionEstablished() && isAssistantReady();
  });

  // ── Effects ──────────────────────────────────────────────────────────────

  // Keep the tab title translated for the active language — but only while the assistant is the
  // visible route. This route is reused (reuse: true): its effects keep running while the component
  // is detached, so a language change on another page updates pageTitle() and must NOT call setTitle
  // here (it would clobber the active page's title). The URL guard scopes the write to /assistant;
  // the selection guard leaves an open document preview's title untouched (mirrors home/search).
  effect(() => {
    const title = pageTitle();
    const path = currentUrl()?.split(/[?#]/)[0];
    if (title && !selectionStore.id?.() && path === "/assistant") {
      applicationService.setTitle(title);
    }
  });

  // Recreate the assistant component when an admin switches the impersonated user
  effect(() => {
    const principal = getState(principalStore);
    const { userOverrideActive } = globalConfig;
    if (principal && userOverrideActive) {
      assistantKey.update(v => v + 1);
      if (chat() && isAssistantReady()) {
        startNewChat();
      }
    }
  });

  injectUrlQueryParamsSync(inputs);

  effect(() => {
    getState(queryParamsStore);
    query.set(queryParamsStore.getQuery());
  });

  // Force change detection when the aggregation store updates (ChatComponent is not signal-based)
  effect(() => {
    getState(aggregationStore);
    cdr.detectChanges();
  });

  effect(() => {
    chat()?.askAI(inputs.q?.());
  });

  // ── Methods ──────────────────────────────────────────────────────────────

  function initialize() {
    selectionStore.clear();
    // Set the tab title on every (re)attach. This route is reused (reuse: true) so the component is
    // created once and thawed on return; relying solely on the route-guarded effect above is racy on
    // thaw (its flush can run before currentUrl()/selection settle, so the title write is missed).
    // initialize() is the deterministic attach hook (construction + onRouteAttached), so set the
    // title here too. translate() is synchronous and, running on route attach (post-bootstrap), the
    // root i18n file is loaded; guard against the raw key so we never flash "pageTitle.assistant".
    // The effect still covers language changes made while the assistant is the visible route.
    const key = "pageTitle.assistant";
    const title = transloco.translate(key);
    if (title && title !== key) {
      applicationService.setTitle(title);
    }
    getFirstPageQuery();
  }

  async function getFirstPageQuery() {
    const q = appStore.getDefaultQuery() || { name: "_default" };
    const response = await fetchQuery({ isFirstPage: true, name: q.name });
    aggregationStore.update(response.aggregations);
  }

  function startNewChat() {
    const assistantComponent = chat();
    if (!assistantComponent) return;
    // Remove stale ID before creating the new chat so an F5 does not restore it
    localStorage.removeItem(STORAGE_KEY);
    assistantComponent.newChat();
    const newChatId = assistantComponent.sqChat()?.chatService?.chatId;
    if (newChatId) localStorage.setItem(STORAGE_KEY, newChatId);
  }

  function handleConnection(connection: HubConnection) {
    if (connection.state === "Connected") connectionEstablished.set(true);
  }

  function handleReady(ready: boolean) {
    if (!ready) return;
    isAssistantReady.set(true);
    loadSavedChatFromStorage();
  }

  function loadSavedChatFromStorage() {
    const storedChatId = localStorage.getItem(STORAGE_KEY);
    if (!storedChatId) return;
    const chatService = chat()?.sqChat()?.chatService;
    if (!chatService?.savedChats$) return;

    // savedChats$ emits an initial empty value on subscription; skip it and
    // take the first real emission to check whether the stored chat still exists.
    chatService.savedChats$.pipe(skip(1), take(1), takeUntilDestroyed(destroyRef)).subscribe({
      next: chats => {
        if (chats.some(c => c.id === storedChatId)) {
          // Only `id` is consumed by handleLoadSavedChat; other SavedChat fields are not needed here.
          handleLoadSavedChat({ id: storedChatId } as SavedChat);
        } else {
          startNewChat();
        }
      },
      error: err => error("Error loading saved chats:", err)
    });
  }

  async function handleLoadSavedChat(savedChat: SavedChat) {
    localStorage.setItem(STORAGE_KEY, savedChat.id);

    const assistantComponent = chat();
    if (!assistantComponent) {
      warn("Assistant component not available");
      return;
    }

    const sqChat = assistantComponent.sqChat();
    const chatService = sqChat?.chatService;
    if (!chatService) {
      warn("Chat service not available");
      return;
    }

    if (chatService.chatId === savedChat.id) return;

    try {
      const response = await firstValueFrom(chatService.getSavedChat(savedChat.id));
      const firstUserMessage = (response?.history || []).find(msg => msg.role === "user" && msg.content);

      if (firstUserMessage && sqChat) {
        // Subscribe before triggering the load so we don't miss the false emission.
        // loading$ is a hot EventEmitter (no initial value), so this is race-condition-free.
        sqChat.loading$
          .pipe(
            filter(loading => !loading),
            take(1),
            takeUntilDestroyed(destroyRef)
          )
          .subscribe(() => {
            query.update(q => (q ? { ...q, text: firstUserMessage.content as string } : q));
          });
      }

      chatService.loadSavedChat$.next(savedChat);
      chatService.generateChatId(savedChat.id);

      cdr.detectChanges();
    } catch (err) {
      error("Error loading saved chat:", err);
    }
  }

  // ── Initialize on construction ────────────────────────────────────────────

  initialize();

  return {
    query,
    instanceId,
    connectionEstablished,
    isAssistantReady,
    assistantKey,
    showSavedChats,
    showDocumentUploader,
    startNewChat,
    handleConnection,
    handleReady,
    handleLoadSavedChat,
    onRouteAttached: initialize
  };
}
