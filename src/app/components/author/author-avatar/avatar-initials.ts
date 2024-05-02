import { Component, input } from "@angular/core";

@Component({
  selector: 'avatar-initials',
  standalone: true,
  template: `
  <span>{{ initials() }}</span>
`,
})
export class AvatarInitialsComponent {
  initials = input.required<string>();
}