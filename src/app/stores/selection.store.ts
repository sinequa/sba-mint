import { Article } from "@/app/types/articles";
import { Store } from './store';

export class SelectionStore extends Store<Article | Partial<Article> | undefined> { }

export const selectionStore = new SelectionStore();
