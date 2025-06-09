---
title: CSS Variables Reference
---

## Variables

### Typography

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --font-display | 'Segoe UI', 'SF Pro Text', 'Aria', 'sans-serif' | Main display font family |
| --text-xxs | 0.625rem | Extra small text size |

### Layout & Stacking

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --zindex-filter | 100 | Z-index level for filters |
| --zindex-backdrop | 1000 | Z-index level for modal backdrop |
| --zindex-drawer | 2000 | Z-index level for side drawers |
| --zindex-tooltip | 3000 | Z-index level for tooltips |
| --cdk-z-index-overlay | 5000 | Z-index for CDK overlays |
| --panel-max-height | 100% | Maximum panel height |

### Branding

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --logo-small | url('assets/logo/small.svg') | Path to small logo |
| --logo-large | url('assets/logo/large.svg') | Path to large logo |
| --logo-alt-text | 'Sinequa logo' | Alternative text for logo |

### Colors - Base

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --color-background | #ffffff | Main background color |
| --color-foreground | #23272e | Main text color |
| --color-border | #f6f7f9 | Border color |
| --color-input | #d5d9e2 | Input field color |
| --color-ring | #1a73e8 | Focus ring color |

### Colors - Components

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --color-card | #ffffff | Card background color |
| --color-card-foreground | #1c1c1c | Card text color |
| --color-popover | #ffffff | Popover background color |
| --color-popover-foreground | #1c1c1c | Popover text color |
| --color-backdrop | rgba(0, 0, 0, 0.4) | Semi-transparent backdrop color |

### Colors - Interactive

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --color-primary | #0084ff | Primary color |
| --color-primary-hover | #0056ff | Primary color hover state |
| --color-primary-active | #0040bf | Primary color active state |
| --color-primary-foreground | #ffffff | Text color on primary background |
| --color-secondary | #526077 | Secondary color |
| --color-secondary-hover | #434e61 | Secondary color hover state |
| --color-secondary-active | #3a4252 | Secondary color active state |
| --color-secondary-foreground | #ffffff | Text color on secondary background |
| --color-muted | #f6f7f9 | Muted state color |
| --color-muted-foreground | #8695aa | Muted text color |
| --color-accent | #f2f2f2 | Accent color |
| --color-accent-foreground | #1c1c1c | Text color on accent background |

### Colors - Status

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --color-destructive | #ff2a1d | Color for destructive actions |
| --color-destructive-hover | #c8180d | Destructive hover state |
| --color-destructive-active | #a5180f | Destructive active state |
| --color-destructive-disable | #ffc8c5 | Destructive disabled state |
| --color-destructive-foreground | #ffffff | Text on destructive background |
| --color-alert | #ff2a1d | Alert color |
| --color-success | #2ed73f | Success color |
| --color-highlight | #fff7ab | Highlight color |

### Effects

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --drawer-box-shadow | -10px 0px 10px rgba(0, 0, 0, 0.1) | Shadow for side drawers |
| --shadow-dropdown | 6px 4px 20px 0px rgba(0, 0, 0, 0.2) | Shadow for dropdowns |
| --shadow-article | 4px 4px 12px 0px rgba(0, 0, 0, 0.15) | Shadow for articles |
| --backdrop | rgba(0, 0, 0, 0.4) | Modal backdrop color |
| --backdrop-filter | blur(2px) | Blur effect for modal backdrop |
| --animate-progress | progress 5s linear infinite | Progress bar animation |

## Chat Variables

| Variable | Value(s) | Description |
|----------|----------|-------------|
| --ast-reference-expanded-hover-bg | #fff9 | Background color for expanded references on hover |
| --ast-input-bg | white, #f8f8f8 | Background color for chat input area |
| --ast-secondary-bg | #ffeab9 | Secondary background color for assistant messages |
| --ast-user-font-weight | 600 | Font weight for user messages |
| --ast-primary-bg | white | Primary background color for chat messages |
| --ast-size-3 | 1.5rem | Base size for chat elements |
| --text-xxs | 0.625rem | Extra small text size for chat interface |
| --zindex-drawer-chat | 2500 | Z-index for chat drawer |
| --color-primary | #0084ff | Primary color for interactive elements |
| --color-primary-hover | #0056ff | Hover state for primary interactive elements |
| --color-primary-foreground | #ffffff | Text color on primary background |
| --color-muted | #f6f7f9 | Background color for muted elements |
| --color-accent-foreground | #1c1c1c | Text color on accent background |
