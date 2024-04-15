import { Article } from "@/app/types/articles";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

type SelectionState = {
  article: Article;
  id: string;
};

const initialState: SelectionState = {} as SelectionState;

export const SelectionStore = signalStore(
  { providedIn: 'root' },
  withDevtools("Selection"),
  withState(initialState),
  withMethods((store) => ({
    update(article: Article) {
      patchState(store, () => {
        return { article, id: article.id };
      });
    },
    clear() {
      patchState(store, () => {
        return ({article: undefined, id: undefined });
      });
    }
  }))
);