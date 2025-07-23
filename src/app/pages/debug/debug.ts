import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AvatarComponent,
  AvatarFallbackComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ChevronRightIconComponent,
  cn,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogVariants,
  DropdownComponent,
  DropdownContentComponent,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  HorizontalDividerComponent,
  InputComponent,
  ListItemComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  PageHeaderComponent,
  PageHeaderVariants,
  PopoverComponent,
  PopoverContentComponent,
  SearchComponent,
  SidebarComponent,
  SidebarItemComponent,
  SwitchComponent,
  TabComponent,
  TabsComponent,
  UserRoundIconComponent,
  VerticalDividerComponent
} from '@sinequa/ui';

@Component({
  selector: 'app-debug',
  imports: [
    FormsModule,
    ButtonComponent,
    SwitchComponent,
    BadgeComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    TabsComponent,
    TabComponent,
    HorizontalDividerComponent,
    VerticalDividerComponent,
    SidebarComponent,
    SidebarItemComponent,
    AvatarComponent,
    AvatarFallbackComponent,
    UserRoundIconComponent,
    SearchComponent,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    ChevronRightIconComponent,
    FlagEnglishIconComponent,
    FlagFrenchIconComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    DropdownComponent,
    DropdownContentComponent,
    ListItemComponent,
    PageHeaderComponent,
    PopoverComponent,
    PopoverContentComponent,
    InputComponent
  ],
  template: `
    <div class="mx-auto flex flex-col gap-2 p-8">
      <h1>Debug Page</h1>
      <p>This is a debug page for testing purposes.</p>
      <p>Done: avatar-fallback, badge, button, card, dialogs, dividers, dropdown, listitems, menu, pageHeader, popover, search, sidebar, switch, tabs</p>
      <Switch [(toggled)]="toggled" />
    </div>

    <div class="w-full">
      <Tabs class="w-full">
        <Tab class="ms-auto w-fit" value="buttons" [active]="currentTab() === 'buttons'" (click)="currentTab.set('buttons')">Colors & Buttons</Tab>
        <Tab class="w-fit" value="cards" [active]="currentTab() === 'cards'" (click)="currentTab.set('cards')">Cards</Tab>
        <Tab class="w-fit" value="pageHeaders" [active]="currentTab() === 'pageHeaders'" (click)="currentTab.set('pageHeaders')">Page headers</Tab>
        <Tab class="w-fit" value="inputs" [active]="currentTab() === 'inputs'" (click)="currentTab.set('inputs')">Inputs</Tab>
        <Tab class="w-fit" value="searchbars" [active]="currentTab() === 'searchbars'" (click)="currentTab.set('searchbars')">Searchbars</Tab>
        <Tab class="w-fit" value="miscs" [active]="currentTab() === 'miscs'" (click)="currentTab.set('miscs')">Miscs</Tab>
        <Tab class="w-fit" value="sidebars" [active]="currentTab() === 'sidebars'" (click)="currentTab.set('sidebars')">Sidebars</Tab>
        <Tab class="w-fit" value="menus" [active]="currentTab() === 'menus'" (click)="currentTab.set('menus')">Menus & List Items</Tab>
        <Tab class="me-auto w-fit" value="dialogs" [active]="currentTab() === 'dialogs'" (click)="currentTab.set('dialogs')">Dialogs</Tab>
      </Tabs>
    </div>

    @switch (currentTab()) {
      @case ('buttons') {
        <div class="mx-auto flex gap-8 rounded-md border p-8 [&>section>h1]:mb-4">
          <!-- Colors -->
          <section>
            <h1>Colors</h1>

            <div class="flex flex-col gap-4">
              <div class="bg-background text-foreground flex h-10 w-full border-2 border-black px-4 font-semibold dark:border-white">
                <span class="m-auto">Background</span>
              </div>
              <div class="bg-foreground text-background flex h-10 w-full border-2 border-black px-4 font-semibold"><span class="m-auto">Foreground</span></div>
              <div class="bg-primary text-primary-foreground flex h-10 w-full px-4 font-semibold"><span class="m-auto">Primary</span></div>
              <div class="bg-secondary text-secondary-foreground flex h-10 w-full px-4 font-semibold"><span class="m-auto">Secondary</span></div>
              <div class="bg-destructive text-destructive-foreground flex h-10 w-full px-4 font-semibold"><span class="m-auto">Destructive</span></div>
            </div>
          </section>

          <!-- Buttons -->
          <section>
            <h1>Buttons</h1>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <span>Enabled</span>
                <button variant="default" (click)="toggled.set(!toggled())">Default</button>
                <button variant="primary" (click)="toggled.set(!toggled())">Primary</button>
                <button variant="secondary" (click)="toggled.set(!toggled())">Secondary</button>
                <button variant="destructive" (click)="toggled.set(!toggled())">Destructive</button>
                <button variant="outline" (click)="toggled.set(!toggled())">Outline</button>
                <button variant="ghost" (click)="toggled.set(!toggled())">Ghost</button>
                <button variant="link" (click)="toggled.set(!toggled())">Link</button>
                <button variant="ai" (click)="toggled.set(!toggled())">AI</button>
                <div class="flex gap-1">
                  <button size="icon" (click)="toggled.set(!toggled())">
                    <i class="fa-fw far fa-robot"></i>
                  </button>
                  <button size="icon" variant="primary" (click)="toggled.set(!toggled())">
                    <i class="fa-fw far fa-robot"></i>
                  </button>
                  <button size="icon" variant="outline" (click)="toggled.set(!toggled())">
                    <i class="fa-fw far fa-robot"></i>
                  </button>
                </div>
                <button variant="none" (click)="toggled.set(!toggled())">None</button>
              </div>
              <div class="flex flex-col gap-2">
                <span>Disabled</span>
                <button disabled variant="default" (click)="toggled.set(!toggled())">Default</button>
                <button disabled variant="primary" (click)="toggled.set(!toggled())">Primary</button>
                <button disabled variant="secondary" (click)="toggled.set(!toggled())">Secondary</button>
                <button disabled variant="destructive" (click)="toggled.set(!toggled())">Destructive</button>
                <button disabled variant="outline" (click)="toggled.set(!toggled())">Outline</button>
                <button disabled variant="ghost" (click)="toggled.set(!toggled())">Ghost</button>
                <button disabled variant="link" (click)="toggled.set(!toggled())">Link</button>
                <button disabled variant="ai" (click)="toggled.set(!toggled())">AI</button>
                <div class="flex gap-1">
                  <button disabled size="icon" (click)="toggled.set(!toggled())">
                    <i class="fa-fw far fa-robot"></i>
                  </button>
                  <button disabled size="icon" variant="primary" (click)="toggled.set(!toggled())">
                    <i class="fa-fw far fa-robot"></i>
                  </button>
                  <button disabled size="icon" variant="outline" (click)="toggled.set(!toggled())">
                    <i class="fa-fw far fa-robot"></i>
                  </button>
                </div>
                <button disabled variant="none" (click)="toggled.set(!toggled())">None</button>
              </div>
            </div>

            <h1 class="mt-4">Switches</h1>

            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-2">
                <div class="flex gap-2"><Switch variant="default" /> Default</div>
                <div class="flex gap-2"><Switch variant="primary" /> Primary</div>
                <div class="flex gap-2"><Switch variant="secondary" /> Secondary</div>
                <div class="flex gap-2"><Switch variant="destructive" /> Destructive</div>
                <div class="flex gap-2"><Switch variant="link" /> Link</div>
                <div class="flex gap-2"><Switch variant="ai" /> AI</div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex gap-2"><Switch size="xs" variant="default" /> Default</div>
                <div class="flex gap-2"><Switch size="xs" variant="primary" /> Primary</div>
                <div class="flex gap-2"><Switch size="xs" variant="secondary" /> Secondary</div>
                <div class="flex gap-2"><Switch size="xs" variant="destructive" /> Destructive</div>
                <div class="flex gap-2"><Switch size="xs" variant="link" /> Link</div>
                <div class="flex gap-2"><Switch size="xs" variant="ai" /> AI</div>
              </div>
            </div>
          </section>

          <!-- Badges -->
          <section>
            <h1 class="col-span-2">Badges</h1>

            <div class="flex flex-col gap-8">
              <section class="flex max-w-40 flex-wrap gap-2">
                <h2>XXS:</h2>

                <badge size="xxs" variant="default">Default</badge>
                <badge size="xxs" variant="primary">Primary</badge>
                <badge size="xxs" variant="accent">Accent</badge>
                <badge size="xxs" variant="destructive">Destructive</badge>
                <badge size="xxs" variant="outline">Outline</badge>
                <badge size="xxs" variant="ghost">Ghost</badge>
                <badge size="xxs" variant="ai">AI</badge>
                <badge size="xxs" variant="none">None</badge>
              </section>

              <section class="flex max-w-40 flex-wrap gap-2">
                <h2>XS:</h2>

                <badge size="xs" variant="default">Default</badge>
                <badge size="xs" variant="primary">Primary</badge>
                <badge size="xs" variant="accent">Accent</badge>
                <badge size="xs" variant="destructive">Destructive</badge>
                <badge size="xs" variant="outline">Outline</badge>
                <badge size="xs" variant="ghost">Ghost</badge>
                <badge size="xs" variant="ai">AI</badge>
                <badge size="xs" variant="none">None</badge>
              </section>

              <section class="flex max-w-40 flex-wrap gap-2">
                <h2>SM:</h2>

                <badge size="sm" variant="default">Default</badge>
                <badge size="sm" variant="primary">Primary</badge>
                <badge size="sm" variant="accent">Accent</badge>
                <badge size="sm" variant="destructive">Destructive</badge>
                <badge size="sm" variant="outline">Outline</badge>
                <badge size="sm" variant="ghost">Ghost</badge>
                <badge size="sm" variant="ai">AI</badge>
                <badge size="sm" variant="none">None</badge>
              </section>

              <section class="flex max-w-40 flex-wrap gap-2">
                <h2>Default:</h2>

                <badge variant="default">Default</badge>
                <badge variant="primary">Primary</badge>
                <badge variant="accent">Accent</badge>
                <badge variant="destructive">Destructive</badge>
                <badge variant="outline">Outline</badge>
                <badge variant="ghost">Ghost</badge>
                <badge variant="ai">AI</badge>
                <badge variant="none">None</badge>
              </section>
            </div>
          </section>
        </div>
      }

      @case ('cards') {
        <section class="flex flex-wrap gap-3 px-16">
          <Card variant="default" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Default card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with a default style. Click the button below to select or unselect this card. Border should be primary on hover and selected
                state. Background should be primary on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card variant="primary" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Primary card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with a primary style. Click the button below to select or unselect this card. Border should be primary on hover and selected
                state. Background should be primary on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="primary" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card variant="secondary" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Secondary card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with an secondary style. Click the button below to select or unselect this card. Border should be secondary on hover and
                selected state. Background should be secondary on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card variant="destructive" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Destructive card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with a destructive style. Click the button below to select or unselect this card. Border should be destructive on hover and
                selected state. Background should be destructive on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card variant="ai" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>AI card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with an AI style. Click the button below to select or unselect this card. Border should be AI on hover and selected state.
                Background should be AI on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card variant="ghost" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Ghost card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with an ghost style. Click the button below to select or unselect this card. Border should be ghost on hover and selected
                state. Background should be ghost on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>
        </section>

        <section class="flex flex-wrap gap-3 px-16">
          <Card disabled variant="default" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Default card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with a default style. Click the button below to select or unselect this card. Border should be primary on hover and selected
                state. Background should be primary on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card disabled variant="primary" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Primary card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with a Primary style. Click the button below to select or unselect this card. Border should be primary on hover and selected
                state. Background should be primary on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="primary" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card disabled variant="secondary" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Secondary card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with an secondary style. Click the button below to select or unselect this card. Border should be secondary on hover and
                selected state. Background should be secondary on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card disabled variant="destructive" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Destructive card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with a destructive style. Click the button below to select or unselect this card. Border should be destructive on hover and
                selected state. Background should be destructive on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card disabled variant="ai" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>AI card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with an AI style. Click the button below to select or unselect this card. Border should be AI on hover and selected state.
                Background should be AI on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>

          <Card disabled variant="ghost" [class]="cn('max-w-70', selected() ? 'selected' : '')">
            <CardHeader>
              <h1>Ghost card</h1>
            </CardHeader>

            <CardContent>
              <p>
                I should be a card with an ghost style. Click the button below to select or unselect this card. Border should be ghost on hover and selected
                state. Background should be ghost on selected state.
              </p>
            </CardContent>

            <CardFooter class="flex gap-2">
              <button class="ms-auto" variant="ghost" (click)="selected.set(false)">Unselect card</button>
              <button variant="default" (click)="selected.set(true)">Select card</button>
            </CardFooter>
          </Card>
        </section>
      }

      @case ('searchbars') {
        <table class="mx-auto flex flex-col gap-6 [&_tr]:grid [&_tr]:grid-cols-[100px_1fr_1fr] [&_tr]:items-center [&_tr]:gap-6">
          <thead>
            <tr>
              <th></th>
              <th>Enabled</th>
              <th>Disabled</th>
            </tr>
          </thead>
          <tbody class="flex flex-col gap-4 [&_th]:text-right">
            <tr>
              <th>Default</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="default"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="default"></Search>
              </td>
            </tr>
            <tr>
              <th>Primary</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="primary"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="primary"></Search>
              </td>
            </tr>
            <tr>
              <th>Secondary</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="secondary"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="secondary"></Search>
              </td>
            </tr>
            <tr>
              <th>Destructive</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="destructive"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="destructive"></Search>
              </td>
            </tr>
            <tr>
              <th>AI</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="ai"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="ai"></Search>
              </td>
            </tr>
            <tr>
              <th>Outline</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="outline"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="outline"></Search>
              </td>
            </tr>
            <tr>
              <th>Ghost</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="ghost"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="ghost"></Search>
              </td>
            </tr>
            <tr>
              <th>Link</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="link"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="link"></Search>
              </td>
            </tr>
            <tr>
              <th>None</th>
              <td>
                <Search [(ngModel)]="searchValue" variant="none"></Search>
              </td>
              <td>
                <Search disabled [(ngModel)]="searchValue" variant="none"></Search>
              </td>
            </tr>
          </tbody>
        </table>
      }

      @case ('menus') {
        <div class="mx-auto flex gap-6">
          <div>
            <Menu>
              <button variant="ghost">Menu</button>
              <!-- min-w-max used to display all the content -->
              <MenuContent position="bottom-start" class="min-w-max">
                <MenuItem variant="default"><span>Default</span></MenuItem>
                <MenuItem variant="primary"><span>Primary</span></MenuItem>
                <MenuItem variant="secondary"><span>Secondary</span></MenuItem>
                <MenuItem variant="destructive"><span>Destructive</span></MenuItem>
                <MenuItem variant="ai"><span>AI</span></MenuItem>
                <MenuItem variant="outline"><span>Outline</span></MenuItem>
                <MenuItem variant="ghost"><span>Ghost</span></MenuItem>
                <MenuItem variant="link"><span>Link</span></MenuItem>
                <MenuItem variant="none"><span>None</span></MenuItem>
              </MenuContent>
            </Menu>
          </div>

          <div>
            <Menu>
              <button variant="ghost">Menu disabled</button>
              <!-- min-w-max used to display all the content -->
              <MenuContent position="bottom-start" class="min-w-max">
                <MenuItem disabled variant="default"><span>Default</span></MenuItem>
                <MenuItem disabled variant="primary"><span>Primary</span></MenuItem>
                <MenuItem disabled variant="secondary"><span>Secondary</span></MenuItem>
                <MenuItem disabled variant="destructive"><span>Destructive</span></MenuItem>
                <MenuItem disabled variant="ai"><span>AI</span></MenuItem>
                <MenuItem disabled variant="outline"><span>Outline</span></MenuItem>
                <MenuItem disabled variant="ghost"><span>Ghost</span></MenuItem>
                <MenuItem disabled variant="link"><span>Link</span></MenuItem>
                <MenuItem disabled variant="none"><span>None</span></MenuItem>
              </MenuContent>
            </Menu>
          </div>

          <div>
            <Menu>
              <Avatar class="cursor-pointer">
                <AvatarFallback>
                  <UserRound class="size-7 p-1" />
                </AvatarFallback>
              </Avatar>
              <!-- min-w-max used to display all the content -->
              <MenuContent position="bottom-start" class="min-w-max">
                <menu position="left-start">
                  <MenuItem variant="none">
                    <span class="grow">Select language</span>
                    <ChevronRight class="size-4" />
                  </MenuItem>
                  <!-- max with to fit content but min width is 10rem (160px) -->
                  <MenuContent position="left-start" class="max-w-fit min-w-40">
                    <MenuItem variant="none" class="justify-between">
                      <span>English</span>
                      <FlagEnglish class="size-4" />
                    </MenuItem>
                    <MenuItem variant="none" class="justify-between">
                      <span>French</span>
                      <FlagFrench class="size-4" />
                    </MenuItem>
                  </MenuContent>
                </menu>
                <MenuItem variant="destructive">
                  <i class="fa-fw fal fa-trash text-[16px]"></i>
                  <span>Reset user settings</span>
                </MenuItem>
                <HorizontalDivider />
                <MenuItem variant="none">
                  <i class="fa-fw fal fa-user-secret text-[16px]"></i>
                  <span>Override user</span>
                </MenuItem>
                <HorizontalDivider />
                <MenuItem variant="link">
                  <img class="size-4" src="assets/logo/small.svg" alt="sinequa logo" />
                  <span class="grow">A propos de Sinequa</span>
                  <i class="fa-fw far fa-arrow-up-right-from-square text-[12px]"></i>
                </MenuItem>
                <MenuItem variant="none">
                  <i class="fa-fw fal fa-arrow-right-from-bracket text-[16px]"></i>
                  <span class="grow">Log out</span>
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>

          <div class="mx-auto flex gap-4">
            <ul>
              <li variant="default" role="listitem">Default</li>
              <li variant="primary" role="listitem">Primary</li>
              <li variant="secondary" role="listitem">Secondary</li>
              <li variant="destructive" role="listitem">Destructive</li>
              <li variant="ai" role="listitem">AI</li>
              <li variant="outline" role="listitem">Outline</li>
              <li variant="ghost" role="listitem">Ghost</li>
              <li variant="link" role="listitem">Link</li>
              <li variant="none" role="listitem">None</li>
            </ul>

            <ul>
              <li disabled variant="default" role="listitem">Default</li>
              <li disabled variant="primary" role="listitem">Primary</li>
              <li disabled variant="secondary" role="listitem">Secondary</li>
              <li disabled variant="destructive" role="listitem">Destructive</li>
              <li disabled variant="ai" role="listitem">AI</li>
              <li disabled variant="outline" role="listitem">Outline</li>
              <li disabled variant="ghost" role="listitem">Ghost</li>
              <li disabled variant="link" role="listitem">Link</li>
              <li disabled variant="none" role="listitem">None</li>
            </ul>
          </div>
        </div>
      }

      @case ('miscs') {
        <Tabs class="w-full">
          <Tab class="ms-auto w-fit" value="default" variant="default" [active]="currentTab() === 'default'">Default Variant</Tab>
          <Tab class="w-fit" value="accent" variant="accent" [active]="currentTab() === 'accent'">Accent Variant</Tab>
          <Tab class="w-fit" value="destructive" variant="destructive" [active]="currentTab() === 'destructive'"> Destructive Variant </Tab>
          <Tab class="w-fit" value="ai" variant="ai" [active]="currentTab() === 'ai'">AI Variant</Tab>
          <Tab class="w-fit" value="outline" variant="outline" [active]="currentTab() === 'outline'">Outline Variant</Tab>
          <Tab class="me-auto w-fit" value="link" variant="link" [active]="currentTab() === 'link'">Link Variant</Tab>
        </Tabs>

        <div class="mx-auto flex gap-4">
          <Dropdown>
            <button variant="primary">Open dropdown</button>
            <DropdownContent class="p-2">
              <ul class="flex flex-col gap-2">
                <li>France</li>
                <li>Canada</li>
                <li>United States</li>
                <li>Japan</li>
                <li>India</li>
                <li>South Africa</li>
                <li>Brazil</li>
                <li>Germany</li>
                <li>Australia</li>
                <li>United Kingdom</li>
              </ul>
            </DropdownContent>
          </Dropdown>

          <Popover class="">
            <button variant="primary">Open popover</button>
            <PopoverContent class="p-2" position="bottom-end">
              <ul class="flex flex-col gap-2">
                <li>France</li>
                <li>Canada</li>
                <li>United States</li>
                <li>Japan</li>
                <li>India</li>
                <li>South Africa</li>
                <li>Brazil</li>
                <li>Germany</li>
                <li>Australia</li>
                <li>United Kingdom</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>

        <div class="mx-auto flex gap-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-4">
          <div>
            <p>Avatar:</p>
            <Avatar>
              <AvatarFallback class="text-muted-foreground bg-muted text-sm font-semibold">
                <UserRound class="size-7 p-1" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div>
            <p>Horizontal Divider:</p>
            <ul>
              <li>France</li>
              <li><HorizontalDivider /></li>
              <li>Canada</li>
              <li><HorizontalDivider /></li>
              <li>United States</li>
              <li><HorizontalDivider /></li>
              <li>Japan</li>
              <li><HorizontalDivider /></li>
              <li>India</li>
              <li><HorizontalDivider /></li>
              <li>South Africa</li>
              <li><HorizontalDivider /></li>
              <li>Brazil</li>
              <li><HorizontalDivider /></li>
              <li>Germany</li>
              <li><HorizontalDivider /></li>
              <li>Australia</li>
              <li><HorizontalDivider /></li>
              <li>United Kingdom</li>
            </ul>
          </div>

          <div>
            <p>Vertical Divider:</p>
            <ul class="flex gap-2">
              <li>France</li>
              <li><VerticalDivider /></li>
              <li>Canada</li>
              <li><VerticalDivider /></li>
              <li>United States</li>
              <li><VerticalDivider /></li>
              <li>Japan</li>
              <li><VerticalDivider /></li>
              <li>India</li>
              <li><VerticalDivider /></li>
              <li>South Africa</li>
              <li><VerticalDivider /></li>
              <li>Brazil</li>
              <li><VerticalDivider /></li>
              <li>Germany</li>
              <li><VerticalDivider /></li>
              <li>Australia</li>
              <li><VerticalDivider /></li>
              <li>United Kingdom</li>
            </ul>
          </div>
        </div>
      }

      @case ('sidebars') {
        <div class="mx-auto flex h-full w-[60vw] justify-between gap-8">
          <sidebar class="w-fit">
            <sidebar-item variant="default" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-magnifying-glass"></i>
            </sidebar-item>

            <sidebar-item variant="primary" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-palette"></i>
            </sidebar-item>

            <sidebar-item variant="secondary" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-stars"></i>
            </sidebar-item>

            <sidebar-item variant="destructive" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-shredder"></i>
            </sidebar-item>

            <sidebar-item variant="ai" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-robot"></i>
            </sidebar-item>

            <sidebar-item variant="ghost" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-ghost"></i>
            </sidebar-item>

            <sidebar-item variant="link" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-link"></i>
            </sidebar-item>

            <sidebar-item variant="none" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-comment"></i>
            </sidebar-item>
          </sidebar>

          <p class="my-auto ms-auto">Disabled Sidebar Items</p>

          <sidebar class="w-fit">
            <sidebar-item disabled variant="default" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-magnifying-glass"></i>
            </sidebar-item>

            <sidebar-item disabled variant="primary" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-palette"></i>
            </sidebar-item>

            <sidebar-item disabled variant="secondary" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-stars"></i>
            </sidebar-item>

            <sidebar-item disabled variant="destructive" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-shredder"></i>
            </sidebar-item>

            <sidebar-item disabled variant="ai" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-robot"></i>
            </sidebar-item>

            <sidebar-item disabled variant="ghost" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-ghost"></i>
            </sidebar-item>

            <sidebar-item disabled variant="link" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-link"></i>
            </sidebar-item>

            <sidebar-item disabled variant="none" [class]="sidebarSelected() ? 'selected' : ''" (click)="sidebarSelected.set(!sidebarSelected())">
              <i class="far fa-comment"></i>
            </sidebar-item>
          </sidebar>
        </div>
      }

      @case ('dialogs') {
        <div class="mx-auto flex flex-wrap gap-6">
          <div>
            <button variant="default" (click)="dialogVariant.set('default'); dialog.showModal()">Open default dialog</button>
          </div>

          <div>
            <button variant="primary" (click)="dialogVariant.set('primary'); dialog.showModal()">Open primary dialog</button>
          </div>

          <div>
            <button variant="secondary" (click)="dialogVariant.set('secondary'); dialog.showModal()">Open secondary dialog</button>
          </div>

          <div>
            <button variant="destructive" (click)="dialogVariant.set('destructive'); dialog.showModal()">Open destructive dialog</button>
          </div>

          <div>
            <button variant="ai" (click)="dialogVariant.set('ai'); dialog.showModal()">Open ai dialog</button>
          </div>

          <div>
            <button variant="outline" (click)="dialogVariant.set('outline'); dialog.showModal()">Open outline dialog</button>
          </div>

          <div>
            <button variant="ghost" (click)="dialogVariant.set('ghost'); dialog.showModal()">Open ghost dialog</button>
          </div>
        </div>

        <dialog #dialog [variant]="dialogVariant()">
          <DialogHeader>
            <DialogTitle>Here's a title</DialogTitle>
          </DialogHeader>

          <DialogContent class="flex flex-col gap-4">
            <div>I'm the content</div>
          </DialogContent>

          <DialogFooter>
            <button variant="outline" (click)="dialog.close($event)">Close</button>
          </DialogFooter>
        </dialog>
      }

      @case ('pageHeaders') {
        <div class="mx-auto flex gap-4">
          <button class="mx-auto" (click)="pageHeaderToggle.set(!pageHeaderToggle())">Toggle position</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('default')">Set default</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('primary')">Set primary</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('secondary')">Set secondary</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('destructive')">Set destructive</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('ai')">Set ai</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('outline')">Set outline</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('ghost')">Set ghost</button>
          <button class="mx-auto" (click)="pageHeaderStyle.set('none')">Set none</button>
        </div>

        <PageHeader [variant]="pageHeaderStyle()" [position]="pageHeaderToggle() ? 'fixed' : 'default'">
          Page header position: {{ pageHeaderToggle() ? 'fixed' : 'default' }}
        </PageHeader>

        <div class="flex flex-col gap-2">
          <PageHeader variant="default">Default</PageHeader>
          <PageHeader variant="primary">Primary</PageHeader>
          <PageHeader variant="secondary">Secondary</PageHeader>
          <PageHeader variant="destructive">Destructive</PageHeader>
          <PageHeader variant="ai">AI</PageHeader>
          <PageHeader variant="outline">Outline</PageHeader>
          <PageHeader variant="ghost">Ghost</PageHeader>
          <PageHeader variant="none">None</PageHeader>
        </div>
      }

      @case ('inputs') {
        <div class="mx-auto flex gap-4">
          <div class="grid grid-cols-[1fr_100px_1fr] items-center gap-x-4 gap-y-2 [&>span]:text-center">
            <input [(ngModel)]="inputText" placeholder="placeholder" type="text" />
            <span>Text</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="text" />

            <input [(ngModel)]="inputText" placeholder="placeholder" type="email" />
            <span>Email</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="email" />

            <input [(ngModel)]="inputText" placeholder="placeholder" type="password" />
            <span>Password</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="password" />

            <input [(ngModel)]="inputText" placeholder="placeholder" type="number" />
            <span>Number</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="number" />

            <input [(ngModel)]="inputText" placeholder="placeholder" type="tel" />
            <span>Tel</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="tel" />

            <input [(ngModel)]="inputText" placeholder="placeholder" type="url" />
            <span>Url</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="url" />

            <input [(ngModel)]="inputText" placeholder="placeholder" type="time" />
            <span>Time</span>
            <input [(ngModel)]="inputText" disabled placeholder="placeholder" type="time" />
          </div>

          <div class="grid grid-cols-[100px_1fr] items-center gap-x-4 gap-y-2 [&>span]:text-right">
            <span>Default</span>
            <input [(ngModel)]="inputText" variant="default" placeholder="placeholder" type="text" />

            <span>Primary</span>
            <input [(ngModel)]="inputText" variant="primary" placeholder="placeholder" type="text" />

            <span>Secondary</span>
            <input [(ngModel)]="inputText" variant="secondary" placeholder="placeholder" type="text" />

            <span>Destructive</span>
            <input [(ngModel)]="inputText" variant="destructive" placeholder="placeholder" type="text" />

            <span>AI</span>
            <input [(ngModel)]="inputText" variant="ai" placeholder="placeholder" type="text" />

            <span>Outline</span>
            <input [(ngModel)]="inputText" variant="outline" placeholder="placeholder" type="text" />

            <span>Ghost</span>
            <input [(ngModel)]="inputText" variant="ghost" placeholder="placeholder" type="text" />

            <span>Link</span>
            <input [(ngModel)]="inputText" variant="link" placeholder="placeholder" type="text" />

            <span>None</span>
            <input [(ngModel)]="inputText" variant="none" placeholder="placeholder" type="text" />
          </div>
        </div>
      }
    }
  `,
  host: {
    class: 'flex flex-col gap-8 py-5'
  }
})
export class DebugComponent {
  cn = cn;

  readonly currentTab = signal<string>('inputs');
  readonly sidebarSelected = signal<boolean>(false);
  readonly toggled = signal<boolean>(false);
  readonly selected = signal<boolean>(false);
  readonly searchValue = signal<string>('');
  readonly dialogVariant = signal<DialogVariants['variant']>('default');
  readonly pageHeaderToggle = signal<boolean>(false);
  readonly pageHeaderStyle = signal<PageHeaderVariants['variant']>('default');
  readonly inputText = signal<string>('');

  constructor() {
    // Handle dark mode toggle
    effect(() => {
      if (this.toggled()) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    });
  }

  logDebugInfo() {
    console.log('Debug information logged.');
  }
}
