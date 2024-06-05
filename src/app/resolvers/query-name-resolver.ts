import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AppStore } from '../stores';
import { getState } from '@ngrx/signals';

export const queryNameResolver: ResolveFn<string> = (
  route,
  state
) => {
  const appStore = inject(AppStore);
  const { queries } = getState(appStore);

  if(!queries) return '';

  const array = Object.entries(queries).map(([key, value]) => ({key, ...value}));
  return array[0].name;

};