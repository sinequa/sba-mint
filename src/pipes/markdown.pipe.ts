import { inject, Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MarkdownRendererService } from "@services/markdown-renderer.service";

/**
 * Renders a Markdown string to HTML using the shared {@link MarkdownRendererService}.
 *
 * Usage:
 * ```html
 * <div class="prose" [innerHTML]="content | markdown"></div>
 * ```
 *
 * The output is returned as trusted HTML so it can be bound with `[innerHTML]`. Pair it with a
 * `prose` container (Tailwind Typography) to apply the markdown typographic styling.
 */
@Pipe({
  name: "markdown",
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdownRenderer = inject(MarkdownRendererService);

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownRenderer.render(value));
  }
}
