# IRONCLAD Design System

**Version**: 1.0.0
**Last Updated**: 2026-02-02
**Status**: Foundation Specification

---

## 1. Design Principles

### Core Philosophy
IRONCLAD's interface must embody **trust**, **efficiency**, and **clarity** - the same values expected in legal practice.

1. **Professional Authority**: Every element conveys competence and reliability
2. **Scannable Density**: Legal professionals process high-volume information - optimize for rapid comprehension
3. **Explainable UI**: Show system reasoning (AI confidence scores, deadline calculations, conflict sources)
4. **Zero Ambiguity**: Critical actions (signing, filing, disbursements) require explicit confirmation
5. **Time to Interactive < 2s**: Legal work happens in high-pressure bursts

---

## 2. Color Palette

### Primary Colors

```
IRONCLAD NAVY (Primary Brand)
--color-primary-50:  #E8EDF5
--color-primary-100: #C5D1E8
--color-primary-200: #9EB2D8
--color-primary-300: #7793C8
--color-primary-400: #597BBD
--color-primary-500: #3B63B1  <- Primary action color
--color-primary-600: #3558A0
--color-primary-700: #2D4A8C
--color-primary-800: #263D78
--color-primary-900: #1A2856
--color-primary-950: #0F1A3D  <- Navigation backgrounds
```

### Secondary Colors

```
STEEL GRAY (Neutral Foundation)
--color-neutral-0:   #FFFFFF
--color-neutral-50:  #F8F9FA
--color-neutral-100: #F1F3F5
--color-neutral-200: #E9ECEF
--color-neutral-300: #DEE2E6
--color-neutral-400: #CED4DA
--color-neutral-500: #ADB5BD
--color-neutral-600: #868E96
--color-neutral-700: #495057
--color-neutral-800: #343A40
--color-neutral-900: #212529
--color-neutral-950: #0D1117
```

### Semantic Colors (Legal Context)

```
SUCCESS / APPROVED / CLEARED
--color-success-50:  #E8F5E9
--color-success-100: #C8E6C9
--color-success-500: #4CAF50  <- Clear to close, approved status
--color-success-700: #388E3C
--color-success-900: #1B5E20

WARNING / PENDING / REVIEW REQUIRED
--color-warning-50:  #FFF8E1
--color-warning-100: #FFECB3
--color-warning-500: #FFC107  <- Contingency pending, needs review
--color-warning-700: #FFA000
--color-warning-900: #FF6F00

ERROR / OVERDUE / COMPLIANCE ISSUE
--color-danger-50:   #FFEBEE
--color-danger-100:  #FFCDD2
--color-danger-500:  #F44336  <- Missed deadline, conflict detected
--color-danger-700:  #D32F2F
--color-danger-900:  #B71C1C

INFO / ACTIVE / IN PROGRESS
--color-info-50:     #E3F2FD
--color-info-100:    #BBDEFB
--color-info-500:    #2196F3  <- Active matter, in progress
--color-info-700:    #1976D2
--color-info-900:    #0D47A1
```

### Legal-Specific Accent Colors

```
PRIVILEGE INDICATOR (Attorney-Client)
--color-privilege:   #7B1FA2  <- Purple badge for privileged docs

CONFIDENTIAL INDICATOR
--color-confidential: #E65100  <- Orange badge for confidential

TRUST ACCOUNT
--color-trust:       #00695C  <- Teal for trust/escrow funds

AI CONFIDENCE SPECTRUM
--color-ai-high:     #2E7D32  <- 90%+ confidence
--color-ai-medium:   #F57C00  <- 70-89% confidence
--color-ai-low:      #C62828  <- <70% confidence, human review
```

### Dark Mode Mapping

```
Background:          --color-neutral-950
Surface:             --color-neutral-900
Surface Elevated:    --color-neutral-800
Text Primary:        --color-neutral-100
Text Secondary:      --color-neutral-400
Border:              --color-neutral-700
Primary actions:     --color-primary-400 (lighter for contrast)
```

---

## 3. Typography Scale

### Font Stack

```css
/* Primary - UI and Body Text */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont,
                    'Segoe UI', Roboto, sans-serif;

/* Legal Documents - Formal/Print */
--font-family-legal: 'Source Serif Pro', 'Times New Roman',
                     Georgia, serif;

/* Monospace - Code, Reference Numbers */
--font-family-mono: 'JetBrains Mono', 'Fira Code',
                    'SF Mono', Consolas, monospace;
```

### Type Scale (Base 16px)

```
--text-xs:    0.75rem   (12px)  <- Metadata, timestamps
--text-sm:    0.875rem  (14px)  <- Secondary text, table cells
--text-base:  1rem      (16px)  <- Body text, form labels
--text-lg:    1.125rem  (18px)  <- Emphasized body
--text-xl:    1.25rem   (20px)  <- Section headers
--text-2xl:   1.5rem    (24px)  <- Page section titles
--text-3xl:   1.875rem  (30px)  <- Page titles
--text-4xl:   2.25rem   (36px)  <- Dashboard headlines
--text-5xl:   3rem      (48px)  <- Marketing/landing only
```

### Font Weights

```
--font-light:     300
--font-normal:    400  <- Body text default
--font-medium:    500  <- Labels, buttons
--font-semibold:  600  <- Subheadings, emphasis
--font-bold:      700  <- Headings, alerts
```

### Line Heights

```
--leading-none:    1      <- Headlines only
--leading-tight:   1.25   <- Headings
--leading-snug:    1.375  <- Compact UI text
--leading-normal:  1.5    <- Body text (default)
--leading-relaxed: 1.625  <- Legal document text
--leading-loose:   2      <- Terms, fine print
```

### Letter Spacing

```
--tracking-tighter: -0.05em  <- Large headlines
--tracking-tight:   -0.025em <- Headings
--tracking-normal:  0        <- Body text
--tracking-wide:    0.025em  <- All-caps labels
--tracking-wider:   0.05em   <- Small-caps
```

### Typography Application

| Element               | Size      | Weight    | Line Height | Use Case                    |
|-----------------------|-----------|-----------|-------------|-----------------------------|
| Dashboard Title       | text-4xl  | bold      | tight       | "Active Matters"            |
| Page Title            | text-3xl  | bold      | tight       | "Matter: Smith v. Jones"    |
| Section Header        | text-xl   | semibold  | snug        | "Transaction Details"       |
| Card Title            | text-lg   | semibold  | snug        | Matter card header          |
| Body Text             | text-base | normal    | normal      | Descriptions, content       |
| Table Header          | text-sm   | semibold  | snug        | Column headers (uppercase)  |
| Table Cell            | text-sm   | normal    | snug        | Data cells                  |
| Label                 | text-sm   | medium    | none        | Form labels                 |
| Helper Text           | text-xs   | normal    | normal      | Input hints, validation     |
| Badge/Tag             | text-xs   | semibold  | none        | Status badges               |
| Legal Document Body   | text-base | normal    | relaxed     | Contracts, deeds            |
| Legal Document Header | text-lg   | bold      | tight       | Document titles             |

---

## 4. Spacing System (8px Grid)

### Base Unit
All spacing derives from an 8px base unit for consistent vertical rhythm.

```
--space-0:    0
--space-0.5:  0.125rem  (2px)   <- Micro adjustments
--space-1:    0.25rem   (4px)   <- Icon padding
--space-2:    0.5rem    (8px)   <- Tight element gaps
--space-3:    0.75rem   (12px)  <- Compact spacing
--space-4:    1rem      (16px)  <- Default element gap
--space-5:    1.25rem   (20px)  <- Form field spacing
--space-6:    1.5rem    (24px)  <- Section padding
--space-8:    2rem      (32px)  <- Card padding
--space-10:   2.5rem    (40px)  <- Section gaps
--space-12:   3rem      (48px)  <- Major section breaks
--space-16:   4rem      (64px)  <- Page section gaps
--space-20:   5rem      (80px)  <- Page margins
--space-24:   6rem      (96px)  <- Hero sections
```

### Component-Specific Spacing

```
/* Buttons */
--btn-padding-sm:  --space-2 --space-3    (8px 12px)
--btn-padding-md:  --space-2 --space-4    (8px 16px)
--btn-padding-lg:  --space-3 --space-6    (12px 24px)

/* Cards */
--card-padding-sm: --space-4              (16px)
--card-padding-md: --space-6              (24px)
--card-padding-lg: --space-8              (32px)

/* Forms */
--input-padding:   --space-2 --space-3    (8px 12px)
--form-gap:        --space-5              (20px)
--form-section:    --space-8              (32px)

/* Tables */
--cell-padding:    --space-3 --space-4    (12px 16px)
--header-padding:  --space-3 --space-4    (12px 16px)

/* Modal */
--modal-padding:   --space-6              (24px)
--modal-gap:       --space-4              (16px)
```

---

## 5. Border Radius Tokens

```
--radius-none:  0
--radius-sm:    0.125rem  (2px)   <- Subtle rounding (tables)
--radius-md:    0.25rem   (4px)   <- Inputs, small buttons
--radius-lg:    0.5rem    (8px)   <- Cards, modals (default)
--radius-xl:    0.75rem   (12px)  <- Feature cards
--radius-2xl:   1rem      (16px)  <- Large panels
--radius-full:  9999px              <- Pills, avatars
```

### Application Guide

| Component      | Radius    | Rationale                          |
|----------------|-----------|-------------------------------------|
| Button         | radius-md | Professional, not playful          |
| Input          | radius-md | Matches buttons for consistency    |
| Card           | radius-lg | Soft but structured                |
| Modal          | radius-lg | Consistent with cards              |
| Badge          | radius-full | Pill shape for scannability       |
| Avatar         | radius-full | Circular for people               |
| Table          | radius-sm | Minimal, dense data presentation   |
| Dropdown       | radius-md | Matches input it emerges from      |
| Toast          | radius-lg | Attention-drawing                  |

---

## 6. Shadow Tokens

```css
/* Elevation System */
--shadow-none: none;

/* Level 1: Subtle lift (cards on surface) */
--shadow-sm:
  0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Level 2: Default card elevation */
--shadow-md:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Level 3: Elevated elements (dropdowns, popovers) */
--shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Level 4: Modals, overlays */
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1),
  0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Level 5: Maximum elevation (command palette) */
--shadow-2xl:
  0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Inset (pressed states, inputs) */
--shadow-inner:
  inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* Focus rings */
--shadow-focus-primary:
  0 0 0 3px rgb(59 99 177 / 0.4);

--shadow-focus-danger:
  0 0 0 3px rgb(244 67 54 / 0.4);
```

### Shadow Application

| Component       | Shadow     | Notes                              |
|-----------------|------------|------------------------------------|
| Card (resting)  | shadow-sm  | Subtle lift from surface           |
| Card (hover)    | shadow-md  | Increased elevation on interaction |
| Dropdown        | shadow-lg  | Above content                      |
| Modal           | shadow-xl  | Maximum attention                  |
| Tooltip         | shadow-md  | Moderate elevation                 |
| Button (focus)  | shadow-focus-primary | Accessibility ring        |
| Input (focus)   | shadow-focus-primary | Accessibility ring        |
| Sidebar         | shadow-lg  | Right edge shadow                  |

---

## 7. Animation and Transition Specifications

### Duration Scale

```
--duration-instant:  0ms      <- No animation
--duration-fast:     100ms    <- Micro-interactions
--duration-normal:   200ms    <- Standard transitions
--duration-slow:     300ms    <- Complex transitions
--duration-slower:   500ms    <- Page transitions
```

### Easing Functions

```css
/* Standard easing */
--ease-linear:     linear;
--ease-in:         cubic-bezier(0.4, 0, 1, 1);
--ease-out:        cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);

/* Expressive easing (modals, panels) */
--ease-bounce:     cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth:     cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Transition Presets

```css
/* Button states */
--transition-button:
  background-color var(--duration-fast) var(--ease-out),
  border-color var(--duration-fast) var(--ease-out),
  box-shadow var(--duration-fast) var(--ease-out);

/* Card hover */
--transition-card:
  box-shadow var(--duration-normal) var(--ease-out),
  transform var(--duration-normal) var(--ease-out);

/* Input focus */
--transition-input:
  border-color var(--duration-fast) var(--ease-out),
  box-shadow var(--duration-fast) var(--ease-out);

/* Modal entrance */
--transition-modal:
  opacity var(--duration-normal) var(--ease-out),
  transform var(--duration-slow) var(--ease-bounce);

/* Sidebar collapse */
--transition-sidebar:
  width var(--duration-slow) var(--ease-in-out),
  transform var(--duration-slow) var(--ease-in-out);

/* Skeleton loading */
--transition-skeleton:
  background-position 1.5s var(--ease-linear) infinite;
```

### Animation Keyframes

```css
/* Skeleton loading shimmer */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Slide in from right (panels) */
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

/* Scale in (modals) */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* Pulse (notifications) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

/* Spin (loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

### Motion Preferences

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Breakpoint System

```
--breakpoint-sm:   640px    <- Mobile landscape
--breakpoint-md:   768px    <- Tablet portrait
--breakpoint-lg:   1024px   <- Tablet landscape / small desktop
--breakpoint-xl:   1280px   <- Desktop
--breakpoint-2xl:  1536px   <- Large desktop
```

### Container Widths

```
--container-sm:    640px
--container-md:    768px
--container-lg:    1024px
--container-xl:    1280px
--container-2xl:   1440px   <- Maximum content width
```

---

## 9. Z-Index Scale

```
--z-base:        0
--z-dropdown:    10
--z-sticky:      20
--z-fixed:       30
--z-backdrop:    40
--z-modal:       50
--z-popover:     60
--z-tooltip:     70
--z-toast:       80
--z-command:     90    <- Command palette (highest)
```

---

## 10. Icon System

### Size Scale

```
--icon-xs:  0.75rem   (12px)  <- Inline with small text
--icon-sm:  1rem      (16px)  <- Inline with body text
--icon-md:  1.25rem   (20px)  <- Buttons, inputs
--icon-lg:  1.5rem    (24px)  <- Navigation, standalone
--icon-xl:  2rem      (32px)  <- Feature highlights
--icon-2xl: 3rem      (48px)  <- Empty states
```

### Recommended Icon Library
**Lucide Icons** - MIT licensed, consistent 24x24 grid, React-ready

### Icon Color Usage

| Context            | Color                    |
|--------------------|--------------------------|
| Default            | --color-neutral-600      |
| Active/Primary     | --color-primary-500      |
| Success            | --color-success-500      |
| Warning            | --color-warning-500      |
| Error              | --color-danger-500       |
| Disabled           | --color-neutral-400      |
| On dark background | --color-neutral-100      |

---

## 11. CSS Custom Properties Export

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #E8EDF5;
  --color-primary-100: #C5D1E8;
  --color-primary-200: #9EB2D8;
  --color-primary-300: #7793C8;
  --color-primary-400: #597BBD;
  --color-primary-500: #3B63B1;
  --color-primary-600: #3558A0;
  --color-primary-700: #2D4A8C;
  --color-primary-800: #263D78;
  --color-primary-900: #1A2856;
  --color-primary-950: #0F1A3D;

  /* Colors - Neutral */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #F8F9FA;
  --color-neutral-100: #F1F3F5;
  --color-neutral-200: #E9ECEF;
  --color-neutral-300: #DEE2E6;
  --color-neutral-400: #CED4DA;
  --color-neutral-500: #ADB5BD;
  --color-neutral-600: #868E96;
  --color-neutral-700: #495057;
  --color-neutral-800: #343A40;
  --color-neutral-900: #212529;
  --color-neutral-950: #0D1117;

  /* Colors - Semantic */
  --color-success-500: #4CAF50;
  --color-warning-500: #FFC107;
  --color-danger-500: #F44336;
  --color-info-500: #2196F3;

  /* Typography */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-legal: 'Source Serif Pro', 'Times New Roman', Georgia, serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing (8px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 12. Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8EDF5',
          100: '#C5D1E8',
          200: '#9EB2D8',
          300: '#7793C8',
          400: '#597BBD',
          500: '#3B63B1',
          600: '#3558A0',
          700: '#2D4A8C',
          800: '#263D78',
          900: '#1A2856',
          950: '#0F1A3D',
        },
        // ... additional color scales
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        legal: ['Source Serif Pro', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'shimmer': 'shimmer 1.5s linear infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideInRight 300ms ease-out',
      },
    },
  },
};
```

---

*End of Design System Specification*
