import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from "@angular/core";
import {
  AGENT_INSTANCE_ID,
  AGENT_JSON_NAME,
  LoggerService,
  provideDefaultAffordance,
  provideDefaultAgentToolbarActions,
  provideDefaultDebugPresentation,
  provideDefaultEmptyComponent,
  provideDefaultErrorComponent,
  provideDefaultInputFilters,
  provideDefaultRendererPlugins,
  provideDefaultShikiHighlighterConfig,
  provideDefaultToolCardPlugins,
  provideDefaultUserToolbarActions,
  provideDefaultWelcomeComponent,
  RendererService,
  SavedChatsService
} from "@sinequa/agent";

export function provideAgent(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AGENT_JSON_NAME, useValue: "agents" },
    { provide: AGENT_INSTANCE_ID, useValue: "chatSearchInstance" },
    LoggerService,
    SavedChatsService,

    provideEnvironmentInitializer(() => inject(RendererService)),
    // Provide default agent renderer plugins (code-block, links, references, ...)
    provideDefaultRendererPlugins(),

    // Provide default shiki highlighter configuration
    provideDefaultShikiHighlighterConfig(),

    // Provide default tool card plugins (tool-card, tool-card-error, ...)
    provideDefaultToolCardPlugins(),

    // Provide default popup-window strategy for the debug panel
    provideDefaultDebugPresentation(),

    provideDefaultAffordance(),
    provideDefaultAgentToolbarActions(),
    provideDefaultUserToolbarActions(),
    provideDefaultWelcomeComponent(), // keep the animated-robot hero
    provideDefaultEmptyComponent(), // null (hidden) — symmetric default
    provideDefaultErrorComponent(), // null (hidden) — symmetric default
    provideDefaultInputFilters()
  ]);
}
