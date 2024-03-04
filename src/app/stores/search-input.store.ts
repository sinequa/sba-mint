import { Store } from './store';

export class SearchInputStore extends Store<string> { }

export const searchInputStore = new SearchInputStore('');
