import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { DrawerComponent } from '../../drawer.component';
import { DrawerService } from '../../drawer.service';

@Component({
  selector: 'app-drawer-assistant',
  standalone: true,
  imports: [NgClass],
  providers: [DrawerService],
  templateUrl: './assistant.component.html',
  styleUrls: ['../../drawer.component.scss', './assistant.component.scss']
})
export class DrawerAssistantComponent extends DrawerComponent { }
