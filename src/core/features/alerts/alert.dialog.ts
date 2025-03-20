import { Component, computed, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Alert, QueryParamsStore, QueryService, UserSettingsStore } from '@sinequa/atomic-angular';

import {
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogEvent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  InputComponent
} from '@sinequa/ui';

import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'alert-dialog, alertdialog, AlertDialog',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoPipe,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    InputComponent
  ],
  providers: [provideTranslocoScope({ scope: 'alert', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'alert.createAlert' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent class="flex flex-col gap-2">
        <input
          type="text"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-label]="'alert.alertName' | transloco"
          [attr.placeholder]="'alert.alertName' | transloco"
          [ngModel]="alertName()"
          (ngModelChange)="alertName.set($event)" />

        <select
          class="hover:outline-primary focus:outline-primary h-8 w-full rounded-md border border-gray-200 bg-neutral-50 px-2 hover:bg-white hover:outline focus:bg-white focus:outline"
          id="alertFrequency"
          [ngModel]="alertFrequency()"
          (ngModelChange)="alertFrequency.set($event)">
          @for (frequencyValue of frequencies; track $index) {
            <option [value]="frequencyValue">{{ frequency[frequencyValue] }}</option>
          }
        </select>

        <div class="weekdays-grid p-2.5">
          @for (day of weekdays; track $index) {
            <div>
              <input class="me-1" type="checkbox" id="day_{{ day.value }}" [checked]="dayChecked(day.value)" (change)="dayChange($event, day.value)" />
              <label role="button" for="day_{{ day.value }}" class="form-check-label user-select-none cursor-pointer">{{
                'alert.weekdays.' + day.key | transloco
              }}</label>
            </div>
          }
        </div>

        <input type="text" id="alertTimes" autocomplete="off" spellcheck="off" [ngModel]="alertTimes()" (ngModelChange)="alertTimes.set($event)" />

        <div class="px-2.5">
          <input class="me-1" type="checkbox" id="alertActive" [checked]="alertActive()" (change)="alertActive.set(!alertActive())" />
          <label role="button" for="alertActive" class="form-check-label user-select-none cursor-pointer">{{ 'alert.alertActive' | transloco }}</label>
        </div>
      </DialogContent>

      <DialogFooter class="flex-col">
        @if (alert || canUpdateQuery()) {
          <div class="flex w-full flex-col gap-2">
            @if (alert) {
              <button variant="outline" (click)="execute()">
                {{ 'alert.execute' | transloco }}
              </button>
            }
            @if (canUpdateQuery()) {
              <button variant="outline" (click)="updateQuery()">
                {{ 'alert.updateQuery' | transloco }}
              </button>
            }
          </div>
        }
        <div class="ml-auto flex justify-end gap-2">
          <button variant="outline" (click)="dialog.close()">
            {{ 'cancel' | transloco }}
          </button>
          <button (click)="confirm()" [disabled]="invalidForm()">
            {{ 'confirm' | transloco }}
          </button>
        </div>
      </DialogFooter>
    </dialog>
  `,
  styles: `
    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
  `
})
export class AlertDialog {
  private readonly queryService = inject(QueryService);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  frequencies = [Alert.Frequency.Daily, Alert.Frequency.Hourly, Alert.Frequency.Immediate];
  frequency = Alert.Frequency;
  weekdays = [
    { key: 'monday', value: Alert.Days.Monday },
    { key: 'tuesday', value: Alert.Days.Tuesday },
    { key: 'wednesday', value: Alert.Days.Wednesday },
    { key: 'thursday', value: Alert.Days.Thursday },
    { key: 'friday', value: Alert.Days.Friday },
    { key: 'saturday', value: Alert.Days.Saturday },
    { key: 'sunday', value: Alert.Days.Sunday }
  ];

  index?: number;
  alert?: Alert;

  alertName = signal<string>('');
  alertFrequency = signal<Alert.Frequency>(Alert.Frequency.Daily);
  alertDays = signal<Alert.Days>(Alert.Days.None);
  alertTimes = signal<string>('9:00');
  alertActive = signal<boolean>(true);
  canUpdateQuery = signal<boolean>(false);

  invalidForm = computed(() => !this.alertName() || !this.alertTimes());

  closed = output<DialogEvent>();

  open(index: number): void {
    this.showModal(index);
  }

  async showModal(index?: number) {
    this.index = index;

    if (index !== undefined) {
      this.alert = this.userSettingsStore.alerts()[index];
      if (this.alert) {
        this.alertName.set(this.alert.name);
        this.alertFrequency.set(this.alert.frequency);
        this.alertDays.set(this.alert.days);
        this.alertTimes.set(this.alert.times);
        this.alertActive.set(this.alert.active);

        const q = this.queryParamsStore.getQuery();
        const response = await firstValueFrom(this.queryService.search(q, false));
        this.canUpdateQuery.set(response.records?.length > 0);
      }
    } else {
      this.alertName.set('');
      this.alertFrequency.set(Alert.Frequency.Daily);
      this.alertDays.set(Alert.Days.None);
      this.alertTimes.set('9:00');
      this.alertActive.set(true);
    }

    this.dialog()!.showModal();
  }

  async confirm(): Promise<void> {
    if (this.alert) {
      this.update();
    } else {
      this.create();
    }
    this.dialog()!.close();
  }

  private async create(): Promise<void> {
    const alert: Alert = {
      name: this.alertName(),
      description: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      query: this.queryParamsStore.getQuery(),
      frequency: this.alertFrequency(),
      days: this.alertDays(),
      interval: 1,
      index: 1,
      times: this.alertTimes(),
      active: this.alertActive(),
      combine: true,
      respectTabSelection: false
    };

    this.userSettingsStore.createAlert(alert);
  }

  private async update(): Promise<void> {
    this.alert!.name = this.alertName();
    this.alert!.frequency = this.alertFrequency();
    this.alert!.days = this.alertDays();
    this.alert!.times = this.alertTimes();
    this.alert!.active = this.alertActive();

    this.userSettingsStore.updateAlert(this.alert!, this.index!);
  }

  dayChecked(day: Alert.Days): boolean {
    return (this.alertDays() & day) !== 0;
  }

  dayChange(event: Event, day: Alert.Days) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.alertDays.set(this.alertDays() | day);
    } else {
      this.alertDays.set(this.alertDays() & ~day);
    }
  }

  updateQuery() {
    this.alert!.query = this.queryParamsStore.getQuery();
    this.userSettingsStore.updateAlert(this.alert!, this.index!);
    toast.success(this.transloco.translate('alert.queryUpdated'), { duration: 2000 });
  }

  execute() {
    const q = this.alert!.query;
    const filters = Array.isArray(q.filters) ? q.filters : undefined;
    this.queryParamsStore.patch({ text: q.text, tab: q.tab, basket: q.basket, sort: q.sort, filters, name: q.name });
    this.dialog()!.close();
  }
}
