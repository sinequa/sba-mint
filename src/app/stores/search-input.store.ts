import { Store } from './store';

export type SearchInput = {
  text: string;
}

export class SearchInputStore extends Store<SearchInput> { }

export const searchInputStore = new SearchInputStore({ text: '' });
