import { UserSettings } from '../types/articles/user-settings';
import { Store } from './store';

export class UserSettingsStore extends Store<UserSettings> { }

export const userSettingsStore = new UserSettingsStore();
