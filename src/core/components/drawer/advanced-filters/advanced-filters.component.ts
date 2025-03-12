import { Overlay } from '@angular/cdk/overlay';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Aggregation, AggregationItem, FilterOperator, LegacyFilter, TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';
import { AppStore, buildQuery, DrawerStackService, DropdownInputComponent, DropdownItem, QueryParamsStore, QueryService } from '@sinequa/atomic-angular';

import { ButtonComponent, InputComponent } from '@sinequa/ui';

import { DrawerComponent } from '@/core/components/drawer/drawer.component';
import { DrawerService } from '@/core/components/drawer/drawer.service';

import { DrawerNavbarComponent } from '../navbar/drawer-navbar.component';

const loader = ['en', 'fr', 'pl'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`../i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

type Operator = 'all' | 'exact' | 'any' | 'none' | 'matches';

interface Filter {
  column: string;
  alias: string;
  items?: (AggregationItem | TreeAggregationNode)[];
}

const searchRoute = 'search';

@Component({
  selector: 'app-drawer-advanced-filters',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoPipe, DrawerNavbarComponent, DropdownInputComponent, ButtonComponent, InputComponent],
  providers: [DrawerService, provideTranslocoScope({ scope: 'drawers', loader })],
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss']
})
export class DrawerAdvancedFiltersComponent extends DrawerComponent {
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly overlay = inject(Overlay);
  private readonly transloco = inject(TranslocoService);
  private readonly queryService = inject(QueryService);

  protected scrollStrategy = this.overlay.scrollStrategies.reposition();
  protected noop = this.overlay.scrollStrategies.noop();

  selectData: { operator: string; display: string; placeholder?: string }[] = [
    { operator: 'all', display: 'filterContainsAll' },
    { operator: 'exact', display: 'filterContainsExact' },
    { operator: 'any', display: 'filterContainsAny' },
    { operator: 'none', display: 'filterContainsNone' },
    { operator: 'matches', display: 'filterMatches', placeholder: 'you can use AND/OR criteria' }
  ];

  protected readonly form = this.formBuilder.group({
    content: this.formBuilder.group({
      operator: this.formBuilder.control<Operator>('all'),
      value: this.formBuilder.control(undefined)
    }),
    title: this.formBuilder.group({
      operator: this.formBuilder.control<Operator>('all'),
      value: this.formBuilder.control(undefined)
    }),
    location: this.formBuilder.group({
      operator: this.formBuilder.control<Operator>('all'),
      value: this.formBuilder.control(undefined)
    })
  });

  generatedFilters = false;
  currentTab = signal<string>('all');
  currentFilter = signal<string | undefined>(undefined);
  appliedFilters = signal<{ column: string; values: DropdownItem[] }[]>([]);
  suggestions = signal<DropdownItem[]>([]);
  aggregations = signal<(Aggregation | TreeAggregation)[] | undefined>(undefined);

  tabs = computed<string[]>(() => {
    const routeData = this.router.config.find(c => c.path === searchRoute);
    return !routeData ? [] : ['all'].concat(routeData.children!.filter(c => !!c.path && c.path !== 'all' && c.path !== '**').map(c => c.path!));
  });

  filters = computed<Filter[]>(() => {
    console.log('this.appStore.customizationJson().filters', this.appStore.customizationJson());
    return (
      this.appStore
        .customizationJson()
        .filters?.filter(f => f.column !== '#date')
        .map(f => ({
          column: f.column,
          alias: this.appStore.getColumnAlias(f.column),
          items: this.aggregations()?.find(a => a.column === f.column)?.items
        })) || []
    );
  });

  originalText?: string;

  constructor() {
    super();

    this.getAggregations();

    effect(() => {
      untracked(() => {
        if (this.currentTab()) {
          this.generateForm();
        }
      });
    });

    effect(() => {
      untracked(() => {
        this.originalText = getState(this.queryParamsStore).text;
      });
    });
  }

  getAggregations(): void {
    const query: any = buildQuery();
    query.action = 'aggregate';
    query.name = this.appStore.getDefaultQuery()?.name;
    this.queryService.search(query).subscribe(res => {
      this.aggregations.set(res.aggregations);
    });
  }

  onTabChange(tab: string): void {
    this.currentTab.set(tab);
  }

  onSearch(): void {
    // this params alters the query text
    const { content, title, location } = this.form.value;
    let fieldedText = [];
    if (content && content.value) {
      const { operator = 'any', value = '' } = content;
      const text = this.formatFilter(operator, value);
      fieldedText.push(text);
    }
    if (title && title.value) {
      const { operator = 'any', value = '' } = title;
      const text = this.formatFilter(operator, value, 'title');
      fieldedText.push(text);
    }
    if (location && location.value) {
      const { operator = 'any', value = '' } = location;
      const text = this.formatFilter(operator, value, 'location');
      fieldedText.push(text);
    }

    let originalText = this.originalText;

    // now we have to join the fieldedText with the originalText
    // if originalText is empty, we must remove the leading space
    // if originalText is not empty, we must add a AND before the fieldedText
    if (originalText && fieldedText.length) {
      originalText = originalText + ' AND ' + fieldedText.join(' AND ');
    } else {
      originalText = fieldedText.join(' AND ');
    }
    this.queryParamsStore.patch({ text: originalText });

    const filters: LegacyFilter[] = [];
    this.appliedFilters().forEach(filter => {
      if (filter.values.length) {
        // todo should handle dates? how?
        /* if (filter.column.startsWith('modified') || filter.column.startsWith('date')) {
          const valueFrom = this.customFilters.value[`${filter}From`]?.trim();
          const valueTo = this.customFilters.value[`${filter}To`]?.trim();
          if (valueFrom) {
            filters.push(...this.getFilter('like', valueFrom, filter.column));
          }
          if (valueTo) {
            filters.push(...this.getFilter('like', valueTo, filter.column));
          }
        } else { */
        filters.push(
          ...this.getFilter(
            'in',
            filter.values.map(v => v.value),
            filter.column
          )
        );
      }
    });

    this.queryParamsStore.clearFilters();
    if (filters.length) {
      filters.forEach(filter => this.queryParamsStore.updateFilter(filter));
    }

    this.drawerStack.close();

    // ! we need to remove the page parameter from the query params when new search is performed
    const { name } = this.queryParamsStore.getQuery();
    this.router.navigate([`/${searchRoute}/${this.currentTab()}`], {
      queryParams: { q: originalText, p: undefined, t: this.currentTab(), queryName: name },
      queryParamsHandling: 'merge'
    });
  }

  /** Generate the LegacyFilter to add to the query */
  private getFilter(operator: FilterOperator, values: string[], field: string): LegacyFilter[] {
    if (field.startsWith('modified') || field.startsWith('date')) {
      // dates
      const op = field.endsWith('From') ? 'gte' : 'lte';
      const f = field.split(field.endsWith('From') ? 'From' : 'To')[0];
      return [{ operator: op, value: values[0], field: f }];
    } else {
      switch (operator) {
        case 'contains':
        case 'in':
          return [{ operator, values: values, field, display: values[0] }];
        case 'eq':
        case 'like':
          return [{ operator, value: values[0], field, display: values[0] }];
        default:
          return [];
      }
    }
  }

  /** Format content/title/location filters */
  private formatFilter(operator: Operator, value: string, field: 'title' | 'location' | '' = ''): string {
    const fieldStr = field ? `${field}::` : '';
    switch (operator) {
      case 'all':
        return `${fieldStr}[${value}]`;
      case 'exact':
        return `${fieldStr}"${value}"`;
      case 'matches':
        // value can be separated by AND or OR keywords, if it's the case each words must be written field:word1 AND field:word2 etc...
        const words = value.split(/\s+(AND|OR)\s+/);
        return words
          .map(w => {
            if (w === 'AND' || w === 'OR') return w;
            return `(${fieldStr}${w})`;
          })
          .join(' ');
      case 'any':
        const splitWords = value.split(' ');
        return `(${splitWords.map(w => `${fieldStr}[${w}]`).join(' OR ')})`;
      case 'none':
        return `${fieldStr}NOT [${value}]`;
      default:
        return value;
    }
  }

  private generateForm(): void {
    if (this.filters()) {
      const { filters } = getState(this.queryParamsStore);

      this.filters().forEach(filter => {
        if (['modified', 'date'].includes(filter.column) === false) {
          const value = (filters?.find(f => f.field === filter.column) as any) || {};

          let appliedFilter = { column: filter.column, values: value.values?.map((v: string) => ({ value: v })) || [] };
          this.appliedFilters.set([...this.appliedFilters(), appliedFilter]);
        } else {
          // todo dates?
          /* const valueFrom = filters?.find(f => f.field === (filter + 'From')) as any;
          const valueTo = filters?.find(f => f.field === (filter + 'To')) as any;

          this.customFilters.addControl(`${filter}From`, this.formBuilder.control(valueFrom), { emitEvent: false });
          this.customFilters.addControl(`${filter}To`, this.formBuilder.control(valueTo), { emitEvent: false }); */
        }
      });
    }

    this.generatedFilters = true;
  }

  getPlaceholder(key: string): string {
    return this.selectData.find(d => d.operator === this.form.get(key)!.value)?.placeholder || this.transloco.translate('drawers.searchWords');
  }

  /** Get applied filters for a column */
  getItems(column: string): DropdownItem[] {
    return this.appliedFilters().find(f => f.column === column)?.values || [];
  }

  /** add item to current selection */
  addItem(item: DropdownItem, filter: Filter): void {
    const appliedFilter = this.appliedFilters().find(af => af.column === filter.column)!;
    if (!appliedFilter.values.some(v => v.value === item.value)) {
      appliedFilter.values.push(item);
    }
  }

  /** remove item from current selection */
  removeItem(item: DropdownItem, filter: Filter): void {
    const appliedFilter = this.appliedFilters().find(af => af.column === filter.column)!;
    appliedFilter.values = appliedFilter.values.filter(v => v.value !== item.value);
  }

  /** Update suggestions on input focus */
  setFilterFocus(value: string | null, filter: Filter): void {
    this.currentFilter.set(filter.column);
    this.setSuggestions(value);
  }

  /** Update suggestions when typing */
  onInputTyping(value: string | null): void {
    this.setSuggestions(value);
  }

  private setSuggestions(value: string | null): void {
    this.suggestions.set([]);
    const filter = this.filters().find(f => f.column === this.currentFilter());
    if (!!value && !!filter && filter.items?.length) {
      this.suggestions.set(this.getSuggestionItems(value.toLowerCase(), filter.items!).map(i => ({ display: i.display, value: String(i.value) })));
    }
  }

  private getSuggestionItems(value: string, items: (AggregationItem | TreeAggregationNode)[]): (AggregationItem | TreeAggregationNode)[] {
    const res = items.filter(i => (!!i.display && i.display!.toLowerCase().indexOf(value) !== -1) || String(i.value)?.toLowerCase().indexOf(value) !== -1);
    // todo handle tree items
    return res;
  }
}
