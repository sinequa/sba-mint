import { PreviewDefaultComponent } from '@/app/components/preview/default/preview-default.component';
import { PreviewPersonComponent } from '@/app/components/preview/person/preview-person.component';
import { PreviewSlideComponent } from '@/app/components/preview/slide/preview-slide.component';
import { ExtractsLocationService, PreviewService } from '@/app/services/preview';
import { Article } from '@/app/types';
import { getTypeMapForArticleType } from '@/app/utils';
import { NgClass, NgComponentOutlet } from '@angular/common';
import { Component, computed, effect } from '@angular/core';
import { DrawerComponent } from '../../drawer.component';
import { DrawerService } from '../../drawer.service';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';

@Component({
  selector: 'app-drawer-preview',
  standalone: true,
  imports: [NgClass, NgComponentOutlet, AdvancedSearchComponent, PreviewDefaultComponent, PreviewPersonComponent, PreviewSlideComponent],
  providers: [DrawerService, PreviewService, ExtractsLocationService],
  templateUrl: './preview.component.html',
  styleUrls: ['../../drawer.component.scss', './preview.component.scss']
})
export class DrawerPreviewComponent extends DrawerComponent {
  public selectionId: number = -1;

  protected previewType = computed(() => {
    if (this.selectionId === undefined) return undefined;

    return this.selectionHistory.getSelection(this.selectionId)?.type;
  });
  protected previewTypeMap = computed(() => getTypeMapForArticleType(this.previewType() ?? 'default'));

  protected article: Article | Partial<Article> | undefined;
  protected inputs = { 'article': this.selectionHistory.getSelection(this.selectionId ?? -1) };

  private selectionIdEffect = effect(() => {
    this.inputs = { 'article': this.selectionHistory.getSelection(this.selectionId ?? -1) };
    this.article = this.selectionHistory.getSelection(this.selectionId ?? -1);
  });
}
