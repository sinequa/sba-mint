import { UserSettings } from '../types/user-settings';
import { Store } from './store';

export class UserSettingsStore extends Store<UserSettings> { }

export const userSettingsStore = new UserSettingsStore();
