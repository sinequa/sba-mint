import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Alert, buildQuery, UserSettingsStore } from '@sinequa/atomic-angular';
import { Query } from '@sinequa/atomic';
import { AlertFormDialog } from '../alert-form';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`../i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'Alerts',
  standalone: true,
  imports: [TranslocoPipe, AlertFormDialog, DragDropModule],
  templateUrl: './alerts.component.html',
  providers: [provideTranslocoScope({ scope: 'alert', loader })]
})
export class AlertsComponent {
  private readonly userSettingsStore = inject(UserSettingsStore);

  readonly alertFormDialog = viewChild(AlertFormDialog);

  reordering = signal<boolean>(false);
  protected alerts = computed<Alert[]>(() => this.userSettingsStore.alerts());

  tmpAlerts: Alert[];
  query: Query;

  constructor() {
    this.query = buildQuery();

    effect(() => {
      this.tmpAlerts = this.alerts().map(a => Object.assign({}, a));
    });
  }

  onClick(index: number): void {
    this.alertFormDialog()?.showModal(index);
  }

  createAlert(): void {
    this.alertFormDialog()?.showModal();
  }

  deleteAlert(event: Event, index: number) {
    event.stopPropagation();
    this.userSettingsStore.deleteAlert(index);
  }

  async reorder() {
    if (this.reordering()) {
      await this.userSettingsStore.updateAlerts(this.tmpAlerts);
      this.reordering.set(false);
    } else {
      this.reordering.set(true);
    }
  }

  dropped(drop: CdkDragDrop<Alert[]>) {
    if (drop.currentIndex === drop.previousIndex) {
      return;
    }
    this.tmpAlerts.splice(drop.currentIndex, 0, this.tmpAlerts.splice(drop.previousIndex, 1)[0]);
  }
}
