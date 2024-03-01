import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueryStoreService {
  public query = signal('');
}
