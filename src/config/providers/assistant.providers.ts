import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
// @ts-expect-error
import Flow from "@flowjs/flow.js";
import { FlowInjectionToken } from "@flowjs/ngx-flow";
import { markdownItCodeBlockPlugin, markdownItLinkPlugin } from "@sinequa/agent";
import {
  ASSISTANT_CUSTOM_ELEMENTS,
  ASSISTANT_MARKDOWN_IT_PLUGINS,
  CustomElementsService,
  DocumentReferenceComponent,
  ImageReferenceComponent,
  initializeCustomElements,
  markdownItDocumentReferencePlugin,
  markdownItImageReferencePlugin,
  markdownItPageReferencePlugin,
  markdownItTableToolsPlugin,
  PageReferenceComponent,
  TableToolsComponent
} from "@sinequa/assistant/chat";

export function provideAssistant(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideNoopAnimations(), // used by the Assistant components

    // Provides an APP_INITIALIZER which will initialize the custom elements defined in the @sinequa/assistant/chat
    // library. This is required to be able to use the custom elements in Angular components templates.
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCustomElements,
      multi: true,
      deps: [CustomElementsService]
    },
    // Assistant custom elements and markdown-it plugins configuration
    {
      provide: ASSISTANT_CUSTOM_ELEMENTS,
      useValue: {
        "document-reference": DocumentReferenceComponent,
        "page-reference": PageReferenceComponent,
        "image-reference": ImageReferenceComponent,
        // 'code-block': CodeBlockComponent,
        "table-tools": TableToolsComponent
      }
    },
    {
      provide: ASSISTANT_MARKDOWN_IT_PLUGINS,
      useValue: [
        markdownItDocumentReferencePlugin,
        markdownItPageReferencePlugin,
        markdownItImageReferencePlugin,
        markdownItLinkPlugin,
        markdownItCodeBlockPlugin,
        markdownItTableToolsPlugin
      ]
    },
    // used by the upload Assistant service
    { provide: FlowInjectionToken, useValue: Flow }
  ]);
}
