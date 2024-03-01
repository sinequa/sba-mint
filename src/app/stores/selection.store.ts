import { Article } from '@mint/types/articles/article.type';
import { Store } from './store';

export class SelectionStore extends Store<Article | Partial<Article> | undefined> { }

export const selectionStore = new SelectionStore();
