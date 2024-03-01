import { Component } from '@angular/core';

type Application = {
  label: string;
  url: string;
  iconClass?: string;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss'
})
export class ApplicationsComponent {
  public applications: Application[] = [
    { label: 'Jira', url: 'https://jira.example.com', iconClass: 'fa-brands fa-jira' },
    { label: 'Google Drive', url: 'https://drive.google.com', iconClass: 'fa-brands fa-google-drive' },
    { label: 'Emails', url: 'https://mail.example.com', iconClass: 'fa-regular fa-envelope' },
    { label: 'Confluence', url: 'https://confluence.example.com', iconClass: 'fa-brands fa-confluence' },
    { label: 'Github', url: 'https://github.com', iconClass: 'fa-brands fa-github' },
    { label: 'Outlook', url: 'https://outlook.example.com', iconClass: 'fa-regular fa-envelope' },
    { label: 'Slack', url: 'https://slack.com', iconClass: 'fa-brands fa-slack' },
    { label: 'Website name', url: 'https://website.example.com', iconClass: 'fa-regular fa-globe' },
  ];

  public applicationClicked(application: Application): void {
    console.log(application);
  }

  public addApplication(): void {
    console.log('Add application');
  }
}
