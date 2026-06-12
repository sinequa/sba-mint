import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from "@angular/core";
import {
  AGENT_INSTANCE_ID,
  LoggerService,
  provideDefaultDebugPresentation,
  provideDefaultRendererPlugins,
  provideDefaultShikiHighlighterConfig,
  provideDefaultToolCardPlugins,
  RendererService,
  SavedChatsService
} from "@sinequa/agent";

export function provideAgent(): EnvironmentProviders {
  return makeEnvironmentProviders([
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
    provideDefaultDebugPresentation()
  ]);
}
