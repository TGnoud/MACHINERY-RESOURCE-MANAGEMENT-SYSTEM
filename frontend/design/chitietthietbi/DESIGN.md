---
name: Industrial Intelligence
colors:
  surface: '#f6faff'
  surface-dim: '#d6dae0'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fa'
  surface-container: '#eaeef4'
  surface-container-high: '#e4e8ee'
  surface-container-highest: '#dee3e9'
  on-surface: '#171c20'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2c3135'
  inverse-on-surface: '#edf1f7'
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
  background: '#f6faff'
  on-background: '#171c20'
  surface-variant: '#dee3e9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
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
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system for this machinery and resource management platform focuses on **Industrial Precision** combined with **SaaS Efficiency**. The UI is built to feel robust, reliable, and highly functional, mirroring the heavy equipment it tracks. 

The aesthetic style is **Corporate / Modern** with a slight "Technical/Engineering" edge. It utilizes heavy whitespace for clarity in data-dense environments, refined typography for legibility during rapid scanning, and a logical color-coding system for machinery status updates. The emotional response should be one of "Command and Control"—the user feels fully informed and in charge of complex logistics.

## Colors
The palette is rooted in a professional slate-and-blue foundation to provide a neutral environment for high-priority status indicators.

- **Primary (#0ea5e9):** Used for primary actions, active navigation states, and branding elements.
- **Semantic Logic:** Status badges are critical. **Success** indicates equipment is "Ready," **Warning** indicates "Maintenance Required" or "Pending," **Danger** indicates "Critical Error" or "Down," and **Info** indicates "In Use."
- **Neutrals:** We utilize the Slate scale for text (Slate-900 for headings, Slate-600 for body) and background fills (Slate-50) to ensure high legibility and a clean "software" feel.

## Typography
**Inter** is selected for its exceptional legibility in data tables and dashboards. The hierarchy is strictly enforced to help users navigate complex resource lists.

- **Headlines:** Use Slate-900 with tight letter-spacing to feel modern and "impactful."
- **Body:** Standard body text uses Slate-600 for long-form reading, while Slate-900 is used for labels and data values to ensure contrast.
- **Vietnamese Support:** Ensure font-weights are consistent across all diacritics, avoiding clipping in line-heights.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid**. Sidebars are fixed at 280px for desktop, while the main content area expands.

- **Desktop:** 12-column grid, 24px gutters, 32px outer margins.
- **Tablet:** 8-column grid, 16px gutters, 24px outer margins.
- **Mobile:** 4-column grid, 16px gutters, 16px outer margins.
- **Rhythm:** All components follow a 4px or 8px baseline grid to ensure alignment in dense data tables.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** Slate-50 (#f8fafc).
- **Level 1 (Cards/Sheets):** White (#ffffff) with a 1px border of Slate-200.
- **Shadows:** Use a "soft-industrial" shadow—low opacity (4%), large blur (20px), with a subtle Slate tint to keep it grounded.
- **Interactive Depth:** On hover, cards should lift slightly using a tighter, more concentrated shadow to indicate clickability.

## Shapes
The design system uses **Rounded (0.5rem)** as the default for most interactive elements like buttons and inputs. However, **Large Containers (Cards)** must use **rounded-xl (1.5rem)** to soften the industrial data and create a contemporary SaaS feel.

- **Buttons/Inputs:** 8px (rounded-md)
- **Status Badges:** Full pill-shaped (999px)
- **Main Cards:** 24px (rounded-xl)

## Components
Consistent implementation of these core components ensures the platform feels unified.

- **Status Badges:** Used for "Ready," "Maintenance," etc. Must use high-saturation text on a low-saturation (10% opacity) background of the same color. (e.g., Success text on light green background).
- **Data Tables:** Row heights should be 56px (comfortable) or 40px (compact). Header text must be uppercase Slate-500 with a 1px bottom border.
- **Buttons:** 
  - *Primary:* Solid #0ea5e9, White text.
  - *Secondary:* Ghost style with Slate-200 border.
- **Inputs:** 1px Slate-300 border, turning Primary (#0ea5e9) on focus with a 3px soft focus ring.
- **Sidebars:** Use a dark slate background (#0f172a) for the navigation sidebar to differentiate "System Navigation" from "User Content."
- **Cards:** White background, 1px Slate-200 border, 24px internal padding, and 24px corner radius.