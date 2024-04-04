import { Pipe, PipeTransform } from "@angular/core";
import highlightWords, { HighlightWords } from "highlight-words";

@Pipe({
  name: 'highlightWord',
  standalone: true,
  pure: true
})
export class HighlightWordPipe implements PipeTransform {
  transform(value: string, word: string, clipBy?: number): HighlightWords.Chunk[] {
    return highlightWords({ text: value, query: word, clipBy: clipBy }, );
  }
}