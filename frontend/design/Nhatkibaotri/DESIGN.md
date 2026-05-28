---
name: Industrial Intelligence
colors:
  surface: '#ffffff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#8a5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#de8712'
  on-tertiary-container: '#4d2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f8fafc'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  border: '#e2e8f0'
  success: '#22c55e'
  warning: '#f59e0b'
  danger: '#ef4444'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for **GnoudCRM**, a platform dedicated to industrial machinery management and operational intelligence. The brand personality is precise, reliable, and forward-thinking, bridging the gap between heavy industry and high-tech software. 

The design style follows a **Corporate / Modern** aesthetic with a focus on data density and clarity. It prioritizes functionality and systematic organization to reduce cognitive load for users managing complex fleets of equipment. The UI communicates "Industrial Intelligence" through a clean, spacious layout, high-contrast typography, and a structured hierarchy that feels both robust and accessible.

## Colors

The palette is anchored by a vibrant Cyan primary color, symbolizing technology and connectivity within an industrial context. 

- **Primary (#0ea5e9):** Used for primary actions, active states, and key data highlights.
- **Surface & Background:** A sophisticated Slate-based neutral scale separates the workspace. Backgrounds use a cool Slate-50 to provide subtle contrast against white surface cards, reducing eye strain during long-form data entry.
- **Semantic Colors:** Success (Green), Warning (Amber), and Danger (Red) follow industry standards to provide immediate visual feedback regarding machinery status and system alerts.
- **Text:** High-contrast Slate-900 is used for maximum readability of telemetry data, while Slate-500 handles metadata and secondary information.

## Typography

This design system utilizes **Inter** exclusively to maintain a highly legible, systematic appearance across all data-heavy interfaces. 

- **Hierarchy:** Use `display-lg` for dashboard overviews and `headline-md` for machinery detail pages. 
- **Readability:** Body text scales are generous to ensure technical specifications are easily parsed. 
- **Labels:** `label-sm` uses uppercase styling and increased letter spacing for table headers and status badges to differentiate them from interactive text.
- **Data:** For numerical telemetry data, ensure the use of tabular lining figures (tnum) to maintain vertical alignment in lists and tables.

## Layout & Spacing

The layout employs a **Fluid Grid** system designed for high-density information management. 

- **Desktop (1280px+):** 12-column grid with 24px gutters and 32px side margins. 
- **Tablet (768px - 1279px):** 8-column grid with 24px gutters and 24px side margins.
- **Mobile (< 768px):** 4-column grid with 16px gutters and 16px side margins. 

The spacing rhythm is based on a **4px baseline grid**. Use 16px (md) for standard padding within cards and 24px (lg) for vertical section spacing. Machinery dashboards should prioritize "spacious density"—clear grouping of data with sufficient white space between containers to prevent visual clutter.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

1. **Floor:** The background (`#f8fafc`) acts as the base canvas.
2. **Surface:** Main content containers and cards use white backgrounds (`#ffffff`) with a 1px border (`#e2e8f0`).
3. **Elevated:** Active elements or modals use a soft, diffused shadow (0px 4px 6px -1px rgba(15, 23, 42, 0.1)) to lift them off the surface.

Avoid heavy drop shadows or dramatic blurs. Depth should feel physical yet subtle, resembling stacked paper or organized panels in a control room.

## Shapes

The design system utilizes **Rounded (0.5rem / 8px)** geometry. This choice softens the industrial nature of the product, making the software feel modern and approachable without losing its professional edge.

- **Standard (8px):** Primary buttons, input fields, and dashboard cards.
- **Large (16px):** Outer containers or feature-heavy modal overlays.
- **Full (Pill):** Used exclusively for status badges (e.g., "Active", "Maintenance") to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid `#0ea5e9` with white text. 8px border-radius.
- **Secondary:** White background with `#e2e8f0` border and `#0f172a` text.
- **States:** Hover states should darken the background color by 10%.

### Input Fields
- Use a 1px border (`#e2e8f0`) and 8px radius. 
- Focus state: Border changes to `#0ea5e9` with a subtle 2px outer glow.
- Labels are always persistent above the field using `label-md`.

### Cards
- White background, 1px border, 8px radius.
- Use a soft shadow on hover for interactive cards.
- Internal padding is strictly 16px or 24px.

### Status Chips
- Pill-shaped with low-opacity backgrounds derived from semantic colors (e.g., Success: 10% opacity green background with 100% opacity green text).

### Machinery Lists
- Use zebra-striping or subtle 1px dividers. 
- Include a "Status Indicator" dot as the first element in each row for immediate health-check visuals.

### Data Visualization
- Charts should use the primary Cyan for main data lines and Slate-200 for grid lines to keep the focus on the machinery metrics.