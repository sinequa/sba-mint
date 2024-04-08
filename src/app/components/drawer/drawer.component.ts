import { ExtractsLocationService } from '@/app/services/preview/extracts-location.service';
import { PreviewService } from '@/app/services/preview/preview.service';
import { SelectionHistoryService } from '@/app/services/selection-history.service';
import { NgClass, NgComponentOutlet } from '@angular/common';
import { Component, ElementRef, HostBinding, HostListener, OnInit, ViewChild, computed, effect, inject } from '@angular/core';
import { Article } from '@sinequa/atomic';
import { getTypeMapForArticleType } from '../../utils/article-type-registry';
import { PreviewDefaultComponent } from '../preview/default/preview-default.component';
import { PreviewPersonComponent } from '../preview/person/preview-person.component';
import { PreviewSlideComponent } from '../preview/slide/preview-slide.component';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { DrawerService } from './drawer.service';

/**
 * Each Drawer component has it's own preview service as extracts location service
 * Each Drawer knows how to handle the preview of the selected article
 */

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [NgClass, NgComponentOutlet, AdvancedSearchComponent, PreviewDefaultComponent, PreviewPersonComponent, PreviewSlideComponent],
  providers: [DrawerService, PreviewService, ExtractsLocationService],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent implements OnInit {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  @HostBinding('attr.drawer-extended')
  public drawerExtended: boolean = false;

  @HostBinding('style.grid-template-columns')
  public drawerGridTemplateColumns: string = '';

  @HostListener('mousemove', ['$event'])
  public mouseMove(event: MouseEvent): void {
    if (!this.isSliding) return;

    const min = window.innerWidth * 3 / 100;
    const max = window.innerWidth * 46 / 100;
    const width = Math.min(Math.max(event.clientX, min), max);

    this.drawerGridTemplateColumns = `${width}px minmax(min-content, 1fr) var(--drawer-subdrawer-width)`;
  }

  @HostListener('mousedown', ['$event'])
  public mouseDown(event: MouseEvent): void {
    if (event.target !== this.drawerHandle?.nativeElement) return;

    this.disableAnimation();
    this.isSliding = true;
  }

  @HostListener('mouseup')
  public mouseUp(): void {
    if (this.isSliding) this.enableAnimation();

    this.isSliding = false;
  }

  @ViewChild('drawerHandle', { static: true })
  public drawerHandle: ElementRef | undefined;

  public selectionId:number = -1;

  public readonly drawer = inject(DrawerService);

  protected readonly element = inject(ElementRef);
  protected readonly selectionHistory = inject(SelectionHistoryService);

  protected previewType = computed(() => {
    const id = this.selectionId;

    if (id === undefined) return undefined;

    return this.selectionHistory.getSelection(id)?.type;
  });
  protected previewTypeMap = computed(() => getTypeMapForArticleType(this.previewType() ?? 'default'));

  protected article: Article | Partial<Article> | undefined;
  protected inputs = { 'article': this.selectionHistory.getSelection(this.selectionId ?? -1) };

  private selectionIdEffect = effect(() => {
    this.inputs = { 'article': this.selectionHistory.getSelection(this.selectionId ?? -1) };
    this.article = this.selectionHistory.getSelection(this.selectionId ?? -1);
  });
  private drawerOpenEffect = effect(() => {
    this.drawerOpened = this.drawer.isOpened();

    if (!this.drawerOpened) this.resetGridTemplateColumns();
  });

  private drawerExtendEffect = effect(() => {
    this.drawerExtended = this.drawer.isExtended();

    if (!this.drawerExtended) this.resetGridTemplateColumns();
  });

  private isSliding = false;
  private defaultDrawerGridTemplate = '';

  ngOnInit(): void {
    this.defaultDrawerGridTemplate = this.element.nativeElement.style.gridTemplateColumns;
  }

  private disableAnimation(): void {
    this.element.nativeElement.classList.add('no-transition-important');
  }

  private enableAnimation(): void {
    this.element.nativeElement.classList.remove('no-transition-important');
  }

  private resetGridTemplateColumns(): void {
    this.element.nativeElement.style.gridTemplateColumns = this.defaultDrawerGridTemplate;
  }
}
