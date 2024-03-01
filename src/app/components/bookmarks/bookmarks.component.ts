import { Component } from '@angular/core';

type Bookmark = {
  label: string;
  source: string;
  sourceIconClass?: string;
  author?: string;
  parentFolder?: string;
  parentFolderIconClass?: string;
}

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent {
  public bookmarks: Bookmark[] = [
    { source: 'drive', label: 'This is a document title.pdf', author: 'Caroline Halvorson', parentFolder: 'in Customer support' },
    { source: 'jira', label: 'This is an issue title in Jira ', author: 'Ariane Cavet', parentFolder: 'in SINEQUA ES' },
    { source: 'slack', label: 'This is a message', author: 'Eric Leibenguth', parentFolder: 'in customer-solution' },
    { source: 'drive', label: 'This is a document title.pdf', author: 'Caroline Halvorson', parentFolder: 'in Customer support' },
    { source: 'jira', label: 'This is an issue title in Jira', author: 'Ariane Cavet', parentFolder: 'in SINEQUA ES' },
    { source: 'slack', label: 'This is a message', author: 'Eric Leibenguth', parentFolder: 'in customer-solution' },
    { source: 'drive', label: 'This is a document title.pdf', author: 'Caroline Halvorson', parentFolder: 'in Customer support' },
    { source: 'jira', label: 'This is an issue title in Jira ', author: 'Ariane Cavet', parentFolder: 'in SINEQUA ES' },
    { source: 'slack', label: 'This is a message', author: 'Eric Leibenguth', parentFolder: 'in customer-solution' }
  ];

  public bookmarkClicked(bookmark: Bookmark): void {
    console.log(bookmark);
  }
}

