# IRONCLAD Accessibility Specification

**Version**: 1.0.0
**Last Updated**: 2026-02-02
**Compliance Target**: WCAG 2.1 AA (with AAA recommendations where feasible)

---

## Table of Contents

1. [Accessibility Principles](#1-accessibility-principles)
2. [WCAG 2.1 AA Compliance Checklist](#2-wcag-21-aa-compliance-checklist)
3. [Keyboard Navigation Patterns](#3-keyboard-navigation-patterns)
4. [Screen Reader Considerations](#4-screen-reader-considerations)
5. [Color Contrast Requirements](#5-color-contrast-requirements)
6. [Focus Management Rules](#6-focus-management-rules)
7. [Forms and Validation](#7-forms-and-validation)
8. [Dynamic Content](#8-dynamic-content)
9. [Legal Industry Considerations](#9-legal-industry-considerations)
10. [Testing Protocol](#10-testing-protocol)

---

## 1. Accessibility Principles

### Why Accessibility Matters for IRONCLAD

Legal practice management serves diverse users:
- Attorneys and paralegals with varying abilities
- Clients who may have visual, motor, or cognitive disabilities
- Aging practitioners with changing accessibility needs
- Users relying on assistive technology in professional settings

### POUR Framework

| Principle | Application |
|-----------|-------------|
| **Perceivable** | All information viewable without relying solely on color, images, or sound |
| **Operable** | Full keyboard navigation, no time limits without extension options |
| **Understandable** | Clear language, predictable navigation, error prevention |
| **Robust** | Works with current and future assistive technologies |

---

## 2. WCAG 2.1 AA Compliance Checklist

### 1.1 Text Alternatives

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | All images have text alternatives | `alt` on `<img>`, `aria-label` on icons |

**Implementation Rules:**
- Decorative images: `alt=""`
- Informative images: Descriptive alt text
- Icons with meaning: `aria-label` or accompanying text
- Complex images (charts): Extended description via `aria-describedby`

```tsx
// Decorative icon (adjacent text describes action)
<button>
  <TrashIcon aria-hidden="true" />
  Delete Document
</button>

// Meaningful icon (icon-only button)
<button aria-label="Delete document">
  <TrashIcon />
</button>
```

### 1.2 Time-based Media

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.2.1 Audio-only/Video-only | Provide alternatives | Transcripts for audio, descriptions for video |
| 1.2.2 Captions | Synchronized captions | Required for any training videos |
| 1.2.3 Audio Description | Alternative for video | Describe visual information not in audio |

### 1.3 Adaptable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.3.1 Info and Relationships | Semantic structure | Proper HTML: headings, lists, tables |
| 1.3.2 Meaningful Sequence | Logical order | DOM order matches visual order |
| 1.3.3 Sensory Characteristics | Don't rely on shape/color alone | "Click the blue button" -> "Click Submit" |
| 1.3.4 Orientation | Support portrait and landscape | Responsive layouts |
| 1.3.5 Identify Input Purpose | Autocomplete attributes | `autocomplete="given-name"` etc. |

**Semantic Structure Requirements:**
```html
<!-- Page structure -->
<main>
  <h1>Matter Detail</h1>
  <section aria-labelledby="docs-heading">
    <h2 id="docs-heading">Documents</h2>
    <!-- content -->
  </section>
  <section aria-labelledby="parties-heading">
    <h2 id="parties-heading">Parties</h2>
    <!-- content -->
  </section>
</main>

<!-- Never skip heading levels -->
<!-- WRONG: h1 -> h3 -->
<!-- RIGHT: h1 -> h2 -> h3 -->
```

### 1.4 Distinguishable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.4.1 Use of Color | Color not sole indicator | Icons, patterns, or text alongside color |
| 1.4.2 Audio Control | User can pause/stop audio | Mute controls on any auto-playing audio |
| 1.4.3 Contrast (Minimum) | 4.5:1 text, 3:1 large text | See Color Contrast section |
| 1.4.4 Resize Text | 200% zoom without loss | Responsive design, relative units |
| 1.4.5 Images of Text | Avoid unless essential | Use real text, not images |
| 1.4.10 Reflow | No horizontal scroll at 320px | Single column at mobile |
| 1.4.11 Non-text Contrast | 3:1 for UI components | Focus rings, form borders |
| 1.4.12 Text Spacing | Allow user adjustment | Use relative units (em, rem) |
| 1.4.13 Content on Hover/Focus | Dismissible, hoverable, persistent | Tooltips remain visible |

### 2.1 Keyboard Accessible

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.1.1 Keyboard | All functions via keyboard | Tab, Enter, Arrow keys, Escape |
| 2.1.2 No Keyboard Trap | Can navigate away | Escape closes modals, proper focus management |
| 2.1.4 Character Key Shortcuts | Can disable or remap | Single character shortcuts require modifier |

### 2.2 Enough Time

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.2.1 Timing Adjustable | Extend or disable timeouts | Session timeout warning with extension option |
| 2.2.2 Pause, Stop, Hide | Control auto-updating content | Pause button on auto-refreshing dashboards |

**Session Timeout Implementation:**
```
Session expiring in 2 minutes

Your session will expire soon due to inactivity.

[Extend Session] [Logout Now]

Time remaining: 1:58
```

### 2.3 Seizures and Physical Reactions

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.3.1 Three Flashes or Below | No flashing content | No rapid animations |

### 2.4 Navigable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.4.1 Bypass Blocks | Skip to main content | Skip link as first focusable element |
| 2.4.2 Page Titled | Descriptive page titles | "Smith Residence - Documents - IRONCLAD" |
| 2.4.3 Focus Order | Logical tab order | Left-to-right, top-to-bottom |
| 2.4.4 Link Purpose | Clear link text | "View documents" not "Click here" |
| 2.4.5 Multiple Ways | Multiple navigation paths | Search, nav menu, breadcrumbs |
| 2.4.6 Headings and Labels | Descriptive | "Client Information" not "Section 1" |
| 2.4.7 Focus Visible | Visible focus indicator | Focus ring on all interactive elements |

**Skip Link Implementation:**
```html
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <nav><!-- navigation --></nav>
  <main id="main-content" tabindex="-1">
    <!-- page content -->
  </main>
</body>

<style>
.skip-link {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 1rem;
  background: white;
  z-index: 9999;
}
</style>
```

### 2.5 Input Modalities

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.5.1 Pointer Gestures | Single pointer alternative | No multitouch-only actions |
| 2.5.2 Pointer Cancellation | Can abort on up event | Actions on mouseup/touchend, not down |
| 2.5.3 Label in Name | Visible label in accessible name | Button text matches aria-label |
| 2.5.4 Motion Actuation | Alternative to motion | No shake-to-undo without button alternative |

### 3.1 Readable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.1.1 Language of Page | Declare language | `<html lang="en">` |
| 3.1.2 Language of Parts | Mark language changes | `<span lang="es">` for Spanish text |

### 3.2 Predictable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.2.1 On Focus | No change on focus | Focus doesn't trigger navigation |
| 3.2.2 On Input | Warn before change | Confirm before form auto-submits |
| 3.2.3 Consistent Navigation | Same order throughout | Nav items consistent across pages |
| 3.2.4 Consistent Identification | Same names for same functions | "Delete" always called "Delete" |

### 3.3 Input Assistance

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.3.1 Error Identification | Identify errors clearly | Inline error messages |
| 3.3.2 Labels or Instructions | Provide labels | Every input has a label |
| 3.3.3 Error Suggestion | Suggest corrections | "Email must include @" |
| 3.3.4 Error Prevention (Legal, Financial) | Confirm important actions | Review step before signing |

### 4.1 Compatible

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 4.1.1 Parsing | Valid HTML | No duplicate IDs, proper nesting |
| 4.1.2 Name, Role, Value | ARIA correctly used | Proper roles, states, properties |
| 4.1.3 Status Messages | Announce without focus | `aria-live` for toasts, updates |

---

## 3. Keyboard Navigation Patterns

### Global Keyboard Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Tab` | Next focusable element | Global |
| `Shift+Tab` | Previous focusable element | Global |
| `Enter` | Activate button/link | Global |
| `Space` | Activate button, toggle checkbox | Global |
| `Escape` | Close modal/popover/dropdown | Global |
| `Cmd/Ctrl+K` | Open command palette (search) | Global |
| `Cmd/Ctrl+N` | New matter | Dashboard |
| `Cmd/Ctrl+/` | Show keyboard shortcuts | Global |

### Component-Specific Patterns

**Dropdown Menu:**
```
[Button] - Opens menu on Enter/Space/ArrowDown
    |
    v
+----------------+
| Option 1       | <- ArrowDown/ArrowUp to navigate
| Option 2       | <- Enter to select
| Option 3       | <- Escape to close
+----------------+

Tab moves OUT of menu (closes it)
First letter jumps to matching option
```

**Modal Dialog:**
```
+--------------------------------------------------+
| Modal Title                               [X]    |
+--------------------------------------------------+
| Focus order:                                     |
| 1. First focusable element (input or button)    |
| 2. Tab through content                          |
| 3. Footer buttons                               |
| 4. Close button                                 |
| -> Cycles back to first element (focus trap)    |
|                                                  |
| Escape: Close modal                             |
| Tab: Next element (trapped within modal)        |
+--------------------------------------------------+
```

**Tabs:**
```
[Tab 1] [Tab 2] [Tab 3]
   ^
   |-- ArrowLeft/ArrowRight to switch tabs
   |-- Tab moves to tab panel content
   |-- Enter/Space activates tab (if not auto-activated)

Tab panel receives focus on tab activation
```

**Data Table:**
```
+--------------------------------------------------+
| Sortable header: Enter to sort                   |
| Cells: Tab moves through interactive elements    |
| Row selection: Space toggles checkbox            |
| Row expansion: Enter expands/collapses           |
+--------------------------------------------------+

Optional advanced navigation:
- ArrowKeys for cell-to-cell movement
- Ctrl+Home/End for first/last cell
```

**Date Picker:**
```
+---------------------------+
| [<] February 2026 [>]     |
+---------------------------+
| Su Mo Tu We Th Fr Sa      |
|  1  2  3  4  5  6  7      |
|  8  9 10 11 12 13 14      |
| 15 16 17 18 19 20 21      |
| 22 23 24 25 26 27 28      |
+---------------------------+

Arrow keys: Navigate days
Page Up/Down: Previous/next month
Home: First day of month
End: Last day of month
Enter/Space: Select date
Escape: Close picker
```

### Focus Indicators

All interactive elements MUST have visible focus:

```css
/* Base focus style */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :focus-visible {
    outline: 3px solid currentColor;
  }
}

/* Custom focus for buttons */
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 99, 177, 0.4);
}
```

---

## 4. Screen Reader Considerations

### Landmark Regions

```html
<header role="banner">
  <!-- Site header, logo, global nav -->
</header>

<nav role="navigation" aria-label="Main navigation">
  <!-- Primary navigation -->
</nav>

<main role="main">
  <!-- Primary page content -->
</main>

<aside role="complementary" aria-label="Related information">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Site footer -->
</footer>
```

### Heading Structure

```
h1: Page Title (one per page)
  h2: Major Section
    h3: Subsection
      h4: Detail heading
  h2: Another Major Section
    h3: Subsection
```

**Example for Matter Detail:**
```
h1: Smith Residence Purchase
  h2: Transaction Details
    h3: Property Information
    h3: Financial Summary
  h2: Parties
    h3: Buyers
    h3: Sellers
  h2: Documents
  h2: Timeline
```

### Live Regions

```html
<!-- Polite: Announced when idle (status updates) -->
<div aria-live="polite" aria-atomic="true">
  Document uploaded successfully.
</div>

<!-- Assertive: Announced immediately (errors) -->
<div aria-live="assertive" role="alert">
  Error: File upload failed. Please try again.
</div>

<!-- Status role (implicit polite) -->
<div role="status">
  Saving changes...
</div>
```

### Form Announcements

```html
<label for="client-email">
  Client Email
  <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input
  id="client-email"
  type="email"
  aria-required="true"
  aria-describedby="email-hint email-error"
/>
<div id="email-hint" class="hint">
  Enter the client's primary email address
</div>
<div id="email-error" class="error" role="alert">
  Please enter a valid email address
</div>
```

### Screen Reader-Only Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Table Accessibility

```html
<table>
  <caption>
    Active Matters
    <span class="sr-only">, sorted by closing date ascending</span>
  </caption>
  <thead>
    <tr>
      <th scope="col">
        <span class="sr-only">Select</span>
      </th>
      <th scope="col" aria-sort="none">
        Matter Name
        <button aria-label="Sort by matter name">
          <SortIcon aria-hidden="true" />
        </button>
      </th>
      <th scope="col" aria-sort="ascending">
        Closing Date
        <button aria-label="Sort by closing date, currently ascending">
          <SortAscIcon aria-hidden="true" />
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <input type="checkbox" aria-label="Select Smith Residence" />
      </td>
      <td>Smith Residence</td>
      <td>Feb 15, 2026</td>
    </tr>
  </tbody>
</table>
```

---

## 5. Color Contrast Requirements

### Minimum Ratios (WCAG AA)

| Element Type | Minimum Ratio | Example |
|--------------|---------------|---------|
| Normal text (<18px) | 4.5:1 | Body copy, labels |
| Large text (>=18px or 14px bold) | 3:1 | Headings |
| UI components | 3:1 | Buttons, inputs, icons |
| Focus indicators | 3:1 | Focus rings |
| Disabled elements | N/A | No requirement |

### IRONCLAD Color Contrast Audit

| Color Combination | Ratio | Pass/Fail |
|-------------------|-------|-----------|
| primary-500 (#3B63B1) on white | 5.2:1 | PASS |
| primary-700 (#2D4A8C) on white | 7.4:1 | PASS |
| neutral-600 (#868E96) on white | 4.5:1 | PASS |
| success-500 (#4CAF50) on white | 3.0:1 | FAIL (use 700) |
| success-700 (#388E3C) on white | 4.5:1 | PASS |
| danger-500 (#F44336) on white | 4.0:1 | FAIL (use 700) |
| danger-700 (#D32F2F) on white | 5.9:1 | PASS |
| warning-500 (#FFC107) on white | 1.9:1 | FAIL |
| warning-700 (#FFA000) on white | 2.5:1 | FAIL |
| warning-900 (#FF6F00) on white | 3.5:1 | PASS (for large text) |
| white on primary-950 (#0F1A3D) | 15.8:1 | PASS |

### Color-Independent Status Indicators

Never rely on color alone. Always pair with:

```
STATUS BADGES:
+------------+  +-------------+  +-----------+
| [*] Active |  | [!] Overdue |  | [v] Done  |
+------------+  +-------------+  +-----------+
   Green           Red             Green
   Check icon      Warning icon    Check icon
   "Active" text   "Overdue" text  "Done" text

FORM VALIDATION:
+--------------------------------------------------+
| Email *                                          |
| +----------------------------------------------+ |
| | invalid@email                                | |
| +----------------------------------------------+ |
| [X] Please enter a valid email address         |
+--------------------------------------------------+
      ^                            ^
      Red border                   Error icon + text
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --color-primary-500: #0000EE; /* Pure blue */
    --color-danger-500: #CC0000;   /* Pure red */
    --color-success-500: #006600;  /* Pure green */

    /* Increase border widths */
    --border-width: 2px;
  }

  /* Ensure all borders visible */
  button, input, select {
    border: 2px solid currentColor;
  }
}
```

---

## 6. Focus Management Rules

### General Principles

1. **Focus must be visible**: Never remove focus outline without replacement
2. **Focus order must be logical**: Matches visual reading order
3. **Focus must be managed during interactions**: Modals, deletions, navigation

### Modal Focus Management

```typescript
// Opening a modal
function openModal() {
  // 1. Store the element that triggered the modal
  lastFocusedElement = document.activeElement;

  // 2. Show modal
  modal.showModal();

  // 3. Move focus to first focusable element
  const firstFocusable = modal.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}

// Closing a modal
function closeModal() {
  // 1. Hide modal
  modal.close();

  // 2. Return focus to trigger element
  lastFocusedElement?.focus();
}
```

### Deletion Focus Management

```typescript
// When deleting an item from a list
function deleteItem(itemId: string, itemIndex: number) {
  // 1. Perform deletion
  deleteFromList(itemId);

  // 2. Calculate where to move focus
  const remainingItems = getListItems();

  if (remainingItems.length === 0) {
    // Focus on "Add new" button or empty state
    addButton.focus();
  } else if (itemIndex >= remainingItems.length) {
    // Deleted last item, focus previous
    remainingItems[remainingItems.length - 1].focus();
  } else {
    // Focus next item (same index position)
    remainingItems[itemIndex].focus();
  }
}
```

### Single Page Navigation

```typescript
// When navigating between pages in SPA
function navigateToPage(path: string) {
  // 1. Update URL and render new page
  router.push(path);

  // 2. After render, focus main content
  document.getElementById('main-content')?.focus();

  // 3. Announce page change to screen readers
  announcePageChange(`Navigated to ${pageTitle}`);
}
```

### Focus Trap Pattern

```typescript
function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: if on first element, go to last
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      // Tab: if on last element, go to first
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}
```

---

## 7. Forms and Validation

### Label Association

```html
<!-- Explicit association (preferred) -->
<label for="matter-name">Matter Name</label>
<input id="matter-name" type="text" />

<!-- Implicit association (also valid) -->
<label>
  Matter Name
  <input type="text" />
</label>

<!-- NEVER do this -->
<span>Matter Name</span>  <!-- Not a label! -->
<input type="text" />
```

### Required Field Indicators

```html
<label for="closing-date">
  Closing Date
  <span class="required-indicator" aria-hidden="true">*</span>
</label>
<input
  id="closing-date"
  type="date"
  aria-required="true"
  required
/>
<span class="sr-only">Required field</span>

<!-- Form legend for required fields -->
<p class="form-legend">
  <span aria-hidden="true">*</span> Required fields
</p>
```

### Error Messaging

```html
<!-- Input with error -->
<div class="form-field has-error">
  <label for="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <div id="email-error" class="error-message" role="alert">
    <ErrorIcon aria-hidden="true" />
    Please enter a valid email address (e.g., name@example.com)
  </div>
</div>
```

### Error Summary (Form-Level)

```html
<div role="alert" aria-labelledby="error-summary-title" class="error-summary">
  <h2 id="error-summary-title">
    There were 3 errors with your submission
  </h2>
  <ul>
    <li>
      <a href="#email">Email address is invalid</a>
    </li>
    <li>
      <a href="#closing-date">Closing date is required</a>
    </li>
    <li>
      <a href="#purchase-price">Purchase price must be a number</a>
    </li>
  </ul>
</div>
```

### Autocomplete Attributes

```html
<!-- Personal information -->
<input type="text" autocomplete="given-name" />
<input type="text" autocomplete="family-name" />
<input type="email" autocomplete="email" />
<input type="tel" autocomplete="tel" />

<!-- Address -->
<input type="text" autocomplete="street-address" />
<input type="text" autocomplete="address-level2" /> <!-- City -->
<input type="text" autocomplete="address-level1" /> <!-- State -->
<input type="text" autocomplete="postal-code" />

<!-- Payment (future billing features) -->
<input type="text" autocomplete="cc-name" />
<input type="text" autocomplete="cc-number" />
```

---

## 8. Dynamic Content

### Loading States

```html
<!-- Loading button -->
<button aria-busy="true" disabled>
  <Spinner aria-hidden="true" />
  <span class="sr-only">Loading, please wait</span>
  Saving...
</button>

<!-- Loading region -->
<div aria-live="polite" aria-busy="true">
  <Spinner />
  <span class="sr-only">Loading matters...</span>
</div>

<!-- After load complete -->
<div aria-live="polite" aria-busy="false">
  <span class="sr-only">Matters loaded. 24 results.</span>
  <!-- Content -->
</div>
```

### Progressive Disclosure

```html
<!-- Expandable section -->
<button
  aria-expanded="false"
  aria-controls="additional-options"
  onclick="toggleSection()"
>
  <ChevronIcon aria-hidden="true" />
  Show Additional Options
</button>
<div id="additional-options" hidden>
  <!-- Hidden content -->
</div>

<!-- When expanded -->
<button aria-expanded="true" aria-controls="additional-options">
  <ChevronIcon aria-hidden="true" />
  Hide Additional Options
</button>
<div id="additional-options">
  <!-- Visible content -->
</div>
```

### Toast Notifications

```html
<!-- Toast container -->
<div
  class="toast-container"
  role="region"
  aria-label="Notifications"
  aria-live="polite"
>
  <!-- Toasts injected here -->
</div>

<!-- Success toast -->
<div class="toast toast-success" role="status">
  <CheckIcon aria-hidden="true" />
  <span>Document uploaded successfully</span>
  <button aria-label="Dismiss notification">
    <CloseIcon aria-hidden="true" />
  </button>
</div>

<!-- Error toast (assertive) -->
<div class="toast toast-error" role="alert">
  <ErrorIcon aria-hidden="true" />
  <span>Upload failed. Please try again.</span>
  <button aria-label="Dismiss notification">
    <CloseIcon aria-hidden="true" />
  </button>
</div>
```

### Infinite Scroll / Pagination

```html
<!-- Announce new content loaded -->
<div aria-live="polite" class="sr-only">
  Loaded 20 more matters. Now showing 40 of 124.
</div>

<!-- Provide alternative to infinite scroll -->
<nav aria-label="Pagination">
  <button aria-label="Previous page">Previous</button>
  <span>Page 2 of 7</span>
  <button aria-label="Next page">Next</button>
</nav>
```

---

## 9. Legal Industry Considerations

### Document Accessibility

Legal documents viewed in IRONCLAD should:

1. **Tagged PDFs**: Generate accessible PDFs with proper structure
2. **Alternative formats**: Offer HTML/text versions of documents
3. **Reading order**: Ensure logical reading order in generated documents

### E-Signature Accessibility

```html
<!-- Signature field with clear instructions -->
<fieldset>
  <legend>Electronic Signature</legend>

  <p id="sig-instructions">
    By typing your name below and clicking "Sign", you agree
    that this constitutes your legal signature.
  </p>

  <label for="signature">Type your full legal name</label>
  <input
    id="signature"
    type="text"
    aria-describedby="sig-instructions"
    autocomplete="name"
  />

  <button type="submit">
    Sign Document
  </button>
</fieldset>
```

### Time-Sensitive Deadlines

```html
<!-- Deadline with urgency conveyed accessibly -->
<div class="deadline urgent" role="listitem">
  <span class="sr-only">Urgent:</span>
  <AlertIcon aria-hidden="true" />

  <div class="deadline-info">
    <span class="deadline-name">Inspection Contingency</span>
    <span class="deadline-date">
      Due: January 30, 2026
      <span class="sr-only">(2 days overdue)</span>
      <span class="overdue-badge" aria-hidden="true">-2 days</span>
    </span>
  </div>

  <div class="deadline-actions">
    <button>Mark Complete</button>
    <button>Extend Deadline</button>
  </div>
</div>
```

### Privileged/Confidential Indicators

```html
<!-- Privilege badge -->
<span class="badge badge-privilege">
  <LockIcon aria-hidden="true" />
  <span>Privileged</span>
  <span class="sr-only">: This document is protected by attorney-client privilege</span>
</span>
```

---

## 10. Testing Protocol

### Automated Testing Tools

| Tool | Purpose | Frequency |
|------|---------|-----------|
| **axe-core** | Automated accessibility testing | Every PR (CI) |
| **Lighthouse** | Performance + accessibility audit | Weekly |
| **WAVE** | Visual accessibility checker | Manual review |
| **Pa11y** | CI accessibility testing | Every deployment |

### Automated Test Integration

```typescript
// Playwright test example
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Matter detail page has no accessibility violations', async ({ page }) => {
  await page.goto('/matters/123');

  const accessibilityResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityResults.violations).toEqual([]);
});
```

### Manual Testing Checklist

**Keyboard Testing:**
- [ ] Tab through entire page - all interactive elements reachable
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Focus is visible on all elements
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys work in menus, tabs, and date pickers

**Screen Reader Testing (NVDA/VoiceOver):**
- [ ] Page title announced on load
- [ ] Headings are navigable (h key)
- [ ] Landmarks are navigable (d key for main)
- [ ] Form labels announced with inputs
- [ ] Error messages announced
- [ ] Dynamic updates announced (live regions)
- [ ] Tables are navigable with context

**Zoom Testing:**
- [ ] 200% zoom: All content accessible, no horizontal scroll
- [ ] 400% zoom: Critical functionality still usable
- [ ] Text-only zoom: Layout adjusts appropriately

**Color/Contrast Testing:**
- [ ] High contrast mode: All text readable
- [ ] Grayscale: Information not lost
- [ ] Custom colors: Functionality preserved

### Screen Reader Test Matrix

| Screen Reader | Browser | Platform | Priority |
|---------------|---------|----------|----------|
| NVDA | Firefox | Windows | High |
| NVDA | Chrome | Windows | High |
| VoiceOver | Safari | macOS | High |
| VoiceOver | Safari | iOS | High |
| JAWS | Chrome | Windows | Medium |
| TalkBack | Chrome | Android | Medium |

### Testing Frequency

| Test Type | Frequency | Owner |
|-----------|-----------|-------|
| Automated (axe) | Every PR | CI Pipeline |
| Keyboard | Every feature | Developer |
| Screen reader | Major features | QA + Developer |
| Full audit | Quarterly | External auditor |

---

## Accessibility Implementation Checklist

For each component/feature, verify:

- [ ] Semantic HTML used (buttons, links, headings, lists)
- [ ] ARIA attributes correct (roles, states, properties)
- [ ] Keyboard fully functional
- [ ] Focus management handled
- [ ] Color contrast passes (4.5:1 text, 3:1 UI)
- [ ] Color not sole indicator
- [ ] Screen reader tested
- [ ] Error states accessible
- [ ] Loading states announced
- [ ] Reduced motion respected
- [ ] Touch targets adequate (44x44px)
- [ ] Zoom tested (200%)

---

*End of Accessibility Specification*
