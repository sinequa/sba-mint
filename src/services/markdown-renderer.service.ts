import { Injectable } from "@angular/core";
import MarkdownIt from "markdown-it";

/**
 * Provides a single, shared markdown-it renderer instance for the whole application.
 *
 * Rendering markdown is stateless, so one configured renderer can be reused everywhere instead of
 * instantiating markdown-it per pipe/component. Register any custom markdown-it plugins here so all
 * consumers share the same configuration.
 */
@Injectable({ providedIn: "root" })
export class MarkdownRendererService {
  /** The shared markdown-it instance (html + linkify enabled). */
  readonly renderer = new MarkdownIt({ html: true, linkify: true });

  /** Renders a markdown string to an HTML string. */
  render(value: string | null | undefined): string {
    return value ? this.renderer.render(value) : "";
  }
}
