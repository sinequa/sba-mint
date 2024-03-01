import { Injectable, inject } from '@angular/core';
import { AggregationListItem } from '@mint/components/filters/components/aggregation-list/aggregation-list.component';
import { Aggregation, AggregationItem } from '@sinequa/atomic';
import { Observable, of } from 'rxjs';
import { aggregationsStore } from '../stores/aggregations.store';
import { MockDataService } from './mock-data.service';

export type DateFilterCode = 'last-day' | 'last-week' | 'last-month' | 'last-year' | 'last-3-years' | 'before-last-year' | 'custom-range';

export type DateFilter = {
  label: string;
  code: DateFilterCode;
  calculated: () => [DateFilterCode, Date | null, Date | null];
}

@Injectable({
  providedIn: 'root'
})
export class AggregationsService {
  public getAggregation(column: string): Aggregation | undefined {
    return aggregationsStore.state?.find((aggregation: Aggregation) => aggregation.column === column);
  }

  public getAggregationItems(column: string): AggregationItem[] | undefined {
    return aggregationsStore.state?.find((aggregation: Aggregation) => aggregation.column === column)?.items;
  }





  private readonly mockSources: Array<{ label: string, iconClass: string }> = [
    { label: 'Google drive', iconClass: 'fab fa-google-drive' },
    { label: 'Dropbox', iconClass: 'fab fa-dropbox' },
    { label: 'Box', iconClass: 'fab fa-box' },
    { label: 'Salesforce', iconClass: 'fab fa-salesforce' },
    { label: 'Github', iconClass: 'fab fa-github' },
    { label: 'Gitlab', iconClass: 'fab fa-gitlab' },
    { label: 'Jira', iconClass: 'fab fa-jira' },
    { label: 'Confluence', iconClass: 'fab fa-confluence' },
    { label: 'Trello', iconClass: 'fab fa-trello' },
    { label: 'Slack', iconClass: 'fab fa-slack' },
    { label: 'Outlook', iconClass: 'fab fa-microsoft' }
  ];
  private readonly mockTreepaths: Array<{ label: string, iconClass: string }> = [
    { label: '/Sharepoint/', iconClass: 'fab fa-microsoft' },
    { label: '/iManage/', iconClass: 'fab fa-dropbox' }
  ];
  private readonly mockLanguages: string[] = [
    'English',
    'French',
    'German',
    'Spanish',
    'Italian',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Portuguese'
  ];
  private readonly mockDates: DateFilter[] = [
    {
      label: 'Since yesterday',
      code: 'last-day',
      calculated: () => [
        'last-day',
        new Date(Date.now() - (24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'This week',
      code: 'last-week',
      calculated: () => [
        'last-week',
        new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'This month',
      code: 'last-month',
      calculated: () => [
        'last-month',
        new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'This year',
      code: 'last-year',
      calculated: () => [
        'last-year',
        new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)),
        new Date()
      ]
    },
    {
      label: 'Last 3 years',
      code: 'last-3-years',
      calculated: () => [
        'last-3-years',
        new Date(0),
        new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000))
      ]
    },
    {
      label: 'Before last year',
      code: 'before-last-year',
      calculated: () => [
        'before-last-year',
        new Date(0),
        new Date(Date.now() - (365 * 24 * 60 * 60 * 1000))
      ]
    },
    {
      label: 'Custom range',
      code: 'custom-range',
      calculated: () => ['custom-range', null, null]
    }
  ]

  private readonly mockData = inject(MockDataService);

  public getMockAggregation(name: string): AggregationListItem[] {
    switch (name) {
      case 'authors': return this.mockData.people().map((person: string) => ({ label: person }));
      case 'labels': return this.mockData.labels().map((label: string) => ({ label }));
      case 'document-types': return this.mockData.doctypes().map((doctypes: string) => ({ label: doctypes }));
      case 'treepaths': return this.mockTreepaths;
      default: return [];
    }
  }

  public getMockAggregation$(name: string): Observable<AggregationListItem[]> {
    switch (name) {
      case 'sources': return of(this.mockSources);
      case 'authors': return of(this.mockData.people().map((person: string) => ({ label: person })));
      case 'labels': return of(this.mockData.labels().map((label: string) => ({ label })));
      case 'document-types': return of(this.mockData.doctypes().map((doctypes: string) => ({ label: doctypes })));
      case 'languages': return of(this.mockLanguages.map((language: string) => ({ label: language })));
      case 'mentioned': return of(this.mockData.people().map((person: string) => ({ label: person })));
      default: return of([]);
    }
  }

  public getMockDateAggregation$(): Observable<DateFilter[]> {
    return of(this.mockDates);
  }
}
