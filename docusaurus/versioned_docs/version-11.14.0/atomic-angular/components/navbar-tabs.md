---
title: Navbar Tabs
---

The `NavbarTabs` component provides a responsive navigation tab system that automatically handles overflow by moving extra tabs to a dropdown menu in your Angular applications.

## API reference

### Inputs

| Property    | Type              | Description                                                                    |
| ----------- | ----------------- | ------------------------------------------------------------------------------ |
| `showCount` | `Input<boolean>`  | Determines whether the count should be displayed in the navbar tabs component. |

## Usage

```ts title="sample.component.ts"
import { NavbarTabsComponent } from "@sinequa/atomic-angular";

@Component({
    selector: "sample-component",
    imports: [NavbarTabsComponent],
    template: `
    <navbar-tabs [showCount]="true" />
    `,
}) export class SampleComponent {
    // The component automatically reads routes from router configuration
    // and displays them as tabs
}
```

### Features

- Automatically generates tabs from router configuration
- Handles responsive overflow with dropdown menu for extra tabs
- Supports tab icons
- Preserves search text when switching tabs
- Integrates with router for navigation

## Visual Schema

### UI Layout

```ascii
┌─────────────────────────────────────────────────────────────────────────┐
│                             NavbarTabsComponent                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────┐  │
│  │     Tab 1         │ │    Tab 2      │ │    Tab 3      │ │    ⋮    │  │
│  │  (Visible Tab)    │ │ (Visible Tab) │ │ (Visible Tab) │ │(Overflow│  │
│  └───────────────────┘ └───────────────┘ └───────────────┘ │  Menu)  │  │
│                                                            └─────────┘  │
│                                                                ▼        │
│                                                          ┌───────────┐  │
│                                                          │  Tab 4    │  │
│                                                          │  Tab 5    │  │
│                                                          │  Tab 6    │  │
│                                                          └───────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Flow Diagram

```mermaid
flowchart TD
    RouterConfig["Angular Router Configuration"] --> |Reads router routes| TabGen["Tab Generation"]
    TabGen --> |Creates array of tabs| Tabs["tabs() computed array"]
    Tabs --> |All tabs| TabsComponent["Tabs Component UI"]
    
    OverflowDir["Overflow Manager Directive"] --> |Monitors available space| VisibleCount["visibleTabCount signal"]
    VisibleCount --> |Updates visible tab limit| TabsComponent
    VisibleCount --> |Tabs beyond visible limit| MoreTabs["moreTabs() computed array"]
    MoreTabs --> |Extra tabs| OverflowMenu["Dropdown Menu"]
    
    TabsComponent --> |Tab clicked| ChangeTabMethod["changeTab() method"]
    OverflowMenu --> |Menu item clicked| ChangeTabMethod
    ChangeTabMethod --> |Closes drawers| CloseDrawers["Close all drawers"]
    ChangeTabMethod --> |Updates navigation| RouterNav["Router Navigation"]
    RouterNav --> |Updates URL| BrowserURL["Browser URL"]
    BrowserURL --> |URL change| CurrentPath["currentPath signal"]
    CurrentPath --> |Updates active state| TabsComponent
```

### Component Architecture

```mermaid
classDiagram
    class NavbarTabsComponent {
        +drawerOpened: signal<boolean>
        +visibleTabCount: signal<number>
        +currentPath: signal<string>
        +tabs(): NavbarTab[]
        +moreTabs(): NavbarTab[]
        +changeTab(tab: NavbarTab): void
    }
    
    class OverflowManagerDirective {
        +count: EventEmitter<number>
    }
    
    class OverflowItemDirective {
        +isVisible: boolean
    }
    
    class TabsComponent {
        +tabs: TabComponent[]
    }
    
    class TabComponent {
        +active: boolean
        +value: string
        +clicked: EventEmitter<void>
    }
    
    class DrawerStackService {
        +closeAll(): void
        +isOpened: Observable<boolean>
    }
    
    class NavigationService {
        +path$: Observable<string>
    }
    
    class RouterService {
        +config: Routes[]
        +navigate(): Promise<boolean>
    }
    
    NavbarTabsComponent --> TabsComponent : uses
    NavbarTabsComponent --> OverflowManagerDirective : uses
    TabsComponent --> TabComponent : contains
    NavbarTabsComponent --> DrawerStackService : injects
    NavbarTabsComponent --> NavigationService : injects
    NavbarTabsComponent --> RouterService : injects
    OverflowManagerDirective --> OverflowItemDirective : manages
```

### Responsive Behavior Visualization

```mermaid
graph TD
    subgraph "Large Screen"
        LS[NavbarTabs] --- LST1[Tab 1]
        LS --- LST2[Tab 2]
        LS --- LST3[Tab 3] 
        LS --- LST4[Tab 4]
        LS --- LST5[Tab 5]
        LS --- LST6[Tab 6]
    end
    
    subgraph "Medium Screen"
        MS[NavbarTabs] --- MST1[Tab 1]
        MS --- MST2[Tab 2]
        MS --- MST3[Tab 3]
        MS --- MST4[Tab 4]
        MS --- MSOverflow{{"⋮"}}
        MSOverflow -.- MSDropdown[Dropdown Menu]
        MSDropdown -.- MST5[Tab 5]
        MSDropdown -.- MST6[Tab 6]
    end
    
    subgraph "Small Screen"
        SS[NavbarTabs] --- SST1[Tab 1]
        SS --- SST2[Tab 2]
        SS --- SSOverflow{{"⋮"}}
        SSOverflow -.- SSDropdown[Dropdown Menu]
        SSDropdown -.- SST3[Tab 3]
        SSDropdown -.- SST4[Tab 4]
        SSDropdown -.- SST5[Tab 5]
        SSDropdown -.- SST6[Tab 6]
    end
    
    Screen1["Resize Event"] --> |Window size changes| ResizeDetect[Resize Detection]
    ResizeDetect --> |Updates visible count| VisCount[visibleTabCount signal]
    VisCount --> |Recalculates| MoreTabs["moreTabs() computed"]
```

### Component Flow

1. **Router Configuration**: Reads tab information from the Angular router configuration
2. **Tab Generation**: Creates tabs from router routes with paths and display names
3. **Overflow Detection**: Uses `overflowManager` directive to detect available space
4. **Visible Tab Count**: Updates `visibleTabCount` signal when layout changes
5. **Overflow Menu**: Places tabs that don't fit (using `moreTabs()` computed property) into a dropdown menu
6. **Navigation**: When a tab is clicked, it uses router navigation and maintains query parameters
