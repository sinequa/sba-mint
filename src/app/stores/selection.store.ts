import { Article } from "@/app/types/articles";
import { queryParamsStore } from "./query-params.store";
import { Store } from './store';

export class SelectionStore extends Store<Article | Partial<Article> | undefined> {
  public override set(article: Article | Partial<Article> | undefined): void {
    super.set(article);

    queryParamsStore.patch({ id: article?.id });
  }

  public override clear(): void {
    super.clear();

    queryParamsStore.patch({ id: undefined });
  }
}

export const selectionStore = new SelectionStore();
