# IRONCLAD Component Specifications

**Version**: 1.0.0
**Last Updated**: 2026-02-02
**Component Library**: `packages/ui`

---

## Table of Contents

1. [Buttons](#1-buttons)
2. [Inputs](#2-inputs)
3. [Select/Dropdown](#3-selectdropdown)
4. [Cards](#4-cards)
5. [Tables](#5-tables)
6. [Badges/Tags](#6-badgestags)
7. [Modals](#7-modals)
8. [Navigation](#8-navigation)
9. [Alerts/Toasts](#9-alertstoasts)
10. [Timeline](#10-timeline)
11. [Progress Indicators](#11-progress-indicators)
12. [Document Viewer](#12-document-viewer)
13. [AI Components](#13-ai-components)

---

## 1. Buttons

### Anatomy

```
+--------------------------------------------------+
|  [icon]   Button Label   [trailing-icon/spinner] |
+--------------------------------------------------+
    ^            ^                    ^
    |            |                    |
 Leading     Label Text           Trailing
  Icon       (required)        Icon/Loading
(optional)                     (optional)
```

### Variants

| Variant   | Use Case                                         |
|-----------|--------------------------------------------------|
| Primary   | Main action: "Create Matter", "Save Document"    |
| Secondary | Alternative action: "Cancel", "Back"             |
| Outline   | Tertiary actions: "Export", "Print"              |
| Ghost     | Inline actions: "Edit", "View More"              |
| Danger    | Destructive: "Delete", "Void", "Terminate"       |
| Link      | Navigation-style: "Learn More", "View All"       |

### Sizes

```
Small (sm):    h-8   px-3  text-sm   icon-16
Medium (md):   h-10  px-4  text-sm   icon-20  <- Default
Large (lg):    h-12  px-6  text-base icon-24
```

### States

```
+-- DEFAULT -----------------------------------------------+
| bg: primary-500 | text: white | border: none            |
| cursor: pointer                                          |
+---------------------------------------------------------+

+-- HOVER -------------------------------------------------+
| bg: primary-600 | shadow: sm                             |
| transition: 100ms ease-out                               |
+---------------------------------------------------------+

+-- FOCUS -------------------------------------------------+
| ring: 3px primary-500/40 | outline: none                 |
| MUST be visible for keyboard navigation                  |
+---------------------------------------------------------+

+-- ACTIVE (pressed) --------------------------------------+
| bg: primary-700 | transform: scale(0.98)                 |
+---------------------------------------------------------+

+-- DISABLED ----------------------------------------------+
| bg: neutral-200 | text: neutral-400                      |
| cursor: not-allowed | pointer-events: none               |
+---------------------------------------------------------+

+-- LOADING -----------------------------------------------+
| content: opacity-0 | spinner: centered, animate-spin     |
| pointer-events: none                                     |
+---------------------------------------------------------+
```

### Accessibility Requirements

- `role="button"` if not using `<button>` element
- `aria-disabled="true"` when disabled (not just `disabled` attribute)
- `aria-busy="true"` when loading
- Minimum touch target: 44x44px on mobile
- Color contrast: 4.5:1 minimum for text on button
- Focus ring MUST be visible (no `outline: none` without replacement)

### Code Example

```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  loading={isSubmitting}
  disabled={!isValid}
  onClick={handleCreateMatter}
>
  Create Matter
</Button>
```

---

## 2. Inputs

### Text Input Anatomy

```
   Label *                        <- Label (optional asterisk for required)
+---------------------------------------------+
| [icon]  Placeholder text...          [X]   |
+---------------------------------------------+
   Helper text or error message       ^
   ^                                  |
   |                              Clear button
Supporting text                   (optional)
```

### Input Types

| Type         | Use Case                           | Mask/Format      |
|--------------|------------------------------------|------------------|
| text         | General input                      | None             |
| email        | Email addresses                    | email validation |
| password     | Credentials                        | masked, toggle   |
| phone        | Phone numbers                      | (XXX) XXX-XXXX   |
| currency     | Dollar amounts                     | $X,XXX.XX        |
| ssn          | Social Security                    | XXX-XX-XXXX      |
| ein          | Employer ID                        | XX-XXXXXXX       |
| date         | Dates                              | MM/DD/YYYY       |
| textarea     | Multi-line text                    | None             |
| search       | Search queries                     | None             |

### States

```
+-- DEFAULT -----------------------------------------------+
| bg: white | border: neutral-300 | text: neutral-900     |
+---------------------------------------------------------+

+-- HOVER -------------------------------------------------+
| border: neutral-400                                      |
+---------------------------------------------------------+

+-- FOCUS -------------------------------------------------+
| border: primary-500 | ring: 3px primary-500/40          |
| Label floats/highlights (optional)                       |
+---------------------------------------------------------+

+-- FILLED ------------------------------------------------+
| border: neutral-300 | text: neutral-900                 |
| Clear button visible (if enabled)                        |
+---------------------------------------------------------+

+-- ERROR -------------------------------------------------+
| border: danger-500 | ring: 3px danger-500/40            |
| Helper text: danger-500, shows error message             |
| aria-invalid="true" | aria-describedby="error-id"       |
+---------------------------------------------------------+

+-- DISABLED ----------------------------------------------+
| bg: neutral-100 | border: neutral-200 | text: neutral-400|
| cursor: not-allowed                                      |
+---------------------------------------------------------+

+-- READ-ONLY ---------------------------------------------+
| bg: neutral-50 | border: neutral-200                     |
| cursor: default | selectable but not editable            |
+---------------------------------------------------------+
```

### Sizing

```
Small:   h-8   text-sm  px-3  (compact forms)
Medium:  h-10  text-sm  px-3  (default)
Large:   h-12  text-base px-4 (prominent inputs)
```

### Accessibility Requirements

- Every input MUST have an associated `<label>`
- Use `aria-describedby` to link helper text and error messages
- Error messages must be announced: `role="alert"` or `aria-live="polite"`
- Required fields: `aria-required="true"` and visible indicator
- Do not rely on placeholder as label

### Code Example

```tsx
<FormField
  label="Property Address"
  required
  error={errors.address}
  hint="Enter the full street address"
>
  <Input
    type="text"
    placeholder="123 Main Street, City, State ZIP"
    value={address}
    onChange={setAddress}
    leftIcon={<MapPinIcon />}
  />
</FormField>
```

---

## 3. Select/Dropdown

### Anatomy

```
   Label
+-----------------------------------------------+
| Selected option                          [v]  |
+-----------------------------------------------+
        |
        v
+-----------------------------------------------+
| [x] Option 1 (selected)                       |
|     Option 2                                  |
| --- Group Label ---                           |
|     Option 3                                  |
|     Option 4                                  |
+-----------------------------------------------+
                Dropdown panel
```

### Variants

| Variant        | Use Case                                    |
|----------------|---------------------------------------------|
| Single Select  | One choice: State, Matter Type              |
| Multi Select   | Multiple choices: Tags, Assignees           |
| Combobox       | Searchable: Client lookup, Party search     |
| Async Combobox | Server-side search: Property search         |

### States

```
TRIGGER STATES (same as Input):
- Default, Hover, Focus, Error, Disabled

OPTION STATES:
+-- DEFAULT -----------------------------------------------+
| bg: transparent | text: neutral-900                      |
+---------------------------------------------------------+

+-- HOVER / KEYBOARD FOCUS --------------------------------+
| bg: primary-50 | text: primary-900                       |
| MUST highlight on arrow key navigation                   |
+---------------------------------------------------------+

+-- SELECTED ----------------------------------------------+
| bg: primary-100 | text: primary-900 | checkmark icon    |
+---------------------------------------------------------+

+-- DISABLED OPTION ---------------------------------------+
| text: neutral-400 | cursor: not-allowed                  |
+---------------------------------------------------------+
```

### Multi-Select Display

```
+-----------------------------------------------+
| [Tag1 x] [Tag2 x] [+3 more]             [v]   |
+-----------------------------------------------+
```

When selected items exceed container, show "+N more" chip.

### Keyboard Navigation

| Key          | Action                                     |
|--------------|--------------------------------------------|
| Enter/Space  | Open dropdown / Select focused option      |
| Escape       | Close dropdown                             |
| Arrow Down   | Move focus to next option                  |
| Arrow Up     | Move focus to previous option              |
| Home         | Move focus to first option                 |
| End          | Move focus to last option                  |
| Type chars   | Jump to matching option (typeahead)        |

### Accessibility Requirements

- Use `role="listbox"` for dropdown panel
- Use `role="option"` for each option
- `aria-selected="true"` for selected options
- `aria-expanded` on trigger
- `aria-activedescendant` for keyboard focus tracking

---

## 4. Cards

### Matter Card Anatomy

```
+----------------------------------------------------------+
|  [Status Badge]                            [More Menu ...] |
|                                                            |
|  Matter Title / Name                                       |
|  Property Address or Description                           |
|                                                            |
|  +------------------------------------------------------+ |
|  | [Client Icon] Client Name     [Calendar] Closing Date| |
|  +------------------------------------------------------+ |
|                                                            |
|  [Pipeline Stage Indicator =====>----------------]         |
|                                                            |
|  [Tag] [Tag] [Tag]                                         |
+----------------------------------------------------------+
```

### Card Variants

| Variant      | Use Case                                      |
|--------------|-----------------------------------------------|
| Default      | Standard content container                    |
| Interactive  | Clickable, navigates to detail (hover states) |
| Selectable   | Checkbox selection for bulk actions           |
| Highlighted  | Featured/urgent items (colored border)        |
| Compact      | Dense list views                              |

### States

```
+-- DEFAULT -----------------------------------------------+
| bg: white | border: neutral-200 | shadow: sm            |
+---------------------------------------------------------+

+-- HOVER (interactive only) ------------------------------+
| shadow: md | border: neutral-300                         |
| transform: translateY(-2px)                              |
| transition: 200ms ease-out                               |
+---------------------------------------------------------+

+-- FOCUS (keyboard navigation) ---------------------------+
| ring: 3px primary-500/40 | outline: none                 |
+---------------------------------------------------------+

+-- SELECTED ----------------------------------------------+
| border: primary-500 | bg: primary-50                     |
| checkbox: checked                                        |
+---------------------------------------------------------+

+-- LOADING -----------------------------------------------+
| Skeleton shimmer overlay                                 |
| Content replaced with animated placeholder bars          |
+---------------------------------------------------------+
```

### Responsive Behavior

```
Desktop (1280px+):  3-4 cards per row, grid layout
Tablet (768-1279):  2 cards per row
Mobile (<768px):    1 card per row, full width, stacked
```

### Accessibility Requirements

- Interactive cards: `role="article"` with `tabindex="0"`
- Clear heading hierarchy within card
- More menu: accessible dropdown with `aria-haspopup`
- Selectable: use actual checkbox input

---

## 5. Tables

### Anatomy

```
+------------------------------------------------------------------------+
| [Checkbox] | Column Header [Sort ^] | Header 2 | Header 3 | Actions    |
+------------------------------------------------------------------------+
| [Checkbox] | Cell data              | Cell     | Cell     | [Edit][Del]|
| [Checkbox] | Cell data              | Cell     | Cell     | [Edit][Del]|
| [Checkbox] | Cell data              | Cell     | Cell     | [Edit][Del]|
+------------------------------------------------------------------------+
| << < | Page 1 of 10 | > >>              Showing 1-20 of 198 results    |
+------------------------------------------------------------------------+
     Pagination controls                        Results summary
```

### Column Types

| Type       | Alignment | Example                          |
|------------|-----------|----------------------------------|
| Text       | Left      | Client name, address             |
| Number     | Right     | Amount, count                    |
| Currency   | Right     | $125,000.00                      |
| Date       | Left      | Feb 15, 2026                     |
| Status     | Center    | [Badge: Active]                  |
| Actions    | Right     | [Edit] [Delete]                  |

### Row States

```
+-- DEFAULT -----------------------------------------------+
| bg: white | border-bottom: neutral-200                   |
+---------------------------------------------------------+

+-- HOVER -------------------------------------------------+
| bg: neutral-50                                           |
+---------------------------------------------------------+

+-- SELECTED ----------------------------------------------+
| bg: primary-50 | checkbox: checked                       |
+---------------------------------------------------------+

+-- EXPANDED (detail row) ---------------------------------+
| bg: neutral-100 | nested content visible                 |
+---------------------------------------------------------+

+-- DISABLED ----------------------------------------------+
| opacity: 0.5 | pointer-events: none                      |
+---------------------------------------------------------+
```

### Sorting Indicators

```
Unsorted:    Column Name
Ascending:   Column Name  ^
Descending:  Column Name  v
```

### Responsive Behavior

```
Desktop:     Full table with all columns
Tablet:      Hide lower priority columns, show on expand
Mobile:      Convert to card stack OR horizontal scroll
```

**Priority System for Column Hiding:**
1. Always show: Primary identifier, status
2. Hide first: Metadata, secondary info
3. Hide second: Timestamps, IDs

### Accessibility Requirements

- Use `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` semantically
- `scope="col"` on column headers
- `aria-sort` on sortable columns
- Row selection: use actual checkbox inputs
- Expandable rows: `aria-expanded` attribute
- For card-on-mobile: maintain semantic structure or use `role="table"`

---

## 6. Badges/Tags

### Anatomy

```
+----------------+
| [Icon] Label   |
+----------------+

+-------------------+
| Label         [X] |
+-------------------+
    Removable tag
```

### Variants

| Variant     | Use Case                                      |
|-------------|-----------------------------------------------|
| Status      | Matter status, task status                    |
| Priority    | Urgency levels                                |
| Category    | Matter type, document type                    |
| Tag         | User-created labels, searchable               |
| Count       | Notification count, items remaining           |
| AI          | Confidence level, AI-generated indicator      |

### Status Badge Colors

| Status       | Background      | Text            | Use Case             |
|--------------|-----------------|-----------------|----------------------|
| Active       | info-100        | info-700        | In progress matters  |
| Pending      | warning-100     | warning-700     | Awaiting action      |
| Completed    | success-100     | success-700     | Closed matters       |
| Urgent       | danger-100      | danger-700      | Time-sensitive       |
| Draft        | neutral-100     | neutral-600     | Incomplete docs      |
| Privileged   | purple-100      | purple-700      | Privileged docs      |

### Size Scale

```
Small:   h-5  px-2  text-xs   (inline, table cells)
Medium:  h-6  px-2.5 text-xs  (default)
Large:   h-7  px-3  text-sm   (prominent display)
```

### Accessibility Requirements

- Use `role="status"` for status badges that update
- Ensure 4.5:1 color contrast
- Removable tags: close button with `aria-label="Remove [tag name]"`
- Don't rely solely on color - use icons or text

---

## 7. Modals

### Anatomy

```
+----------------------------------------------------------------+
|                       BACKDROP (50% opacity)                    |
|    +----------------------------------------------------+      |
|    |  Modal Title                               [X]     |      |
|    +----------------------------------------------------+      |
|    |                                                    |      |
|    |  Modal body content goes here. Can include        |      |
|    |  forms, information, confirmations, etc.          |      |
|    |                                                    |      |
|    |  [Form fields, content, etc.]                     |      |
|    |                                                    |      |
|    +----------------------------------------------------+      |
|    |                    [Cancel]  [Confirm Action]      |      |
|    +----------------------------------------------------+      |
|                                                                 |
+----------------------------------------------------------------+
```

### Size Variants

```
Small:   max-w-md   (400px)   Confirmations, simple forms
Medium:  max-w-lg   (512px)   Standard forms (default)
Large:   max-w-2xl  (672px)   Complex forms, previews
XLarge:  max-w-4xl  (896px)   Document preview, comparisons
Full:    max-w-full           Document editing, dashboards
```

### Modal Types

| Type         | Use Case                              | Footer Actions         |
|--------------|---------------------------------------|------------------------|
| Info         | Read-only information                 | [Close]                |
| Confirm      | Destructive action confirmation       | [Cancel] [Confirm]     |
| Form         | Data entry                            | [Cancel] [Submit]      |
| Wizard       | Multi-step process                    | [Back] [Next/Complete] |
| Alert        | Critical warning                      | [Acknowledge]          |

### Animation

```css
/* Backdrop */
opacity: 0 -> 1 (200ms ease-out)

/* Modal panel */
opacity: 0, scale: 0.95 -> opacity: 1, scale: 1 (300ms ease-bounce)
```

### Keyboard Behavior

| Key     | Action                                      |
|---------|---------------------------------------------|
| Escape  | Close modal (if dismissible)                |
| Tab     | Cycle through focusable elements            |
| S-Tab   | Cycle backwards                             |

### Focus Management

1. On open: Move focus to first focusable element (or close button)
2. Trap focus: Tab cycles only within modal
3. On close: Return focus to trigger element

### Accessibility Requirements

- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to body (if applicable)
- Focus trap: focus MUST NOT escape modal
- Escape key: close unless form has unsaved changes
- Backdrop click: close (configurable)

---

## 8. Navigation

### Sidebar Anatomy

```
+--------------------------------------------------+
| [Logo]  IRONCLAD                         [<<]    |
+--------------------------------------------------+
|                                                   |
| [Home Icon]      Dashboard                        |
|                                                   |
| [Briefcase]      Matters              [Badge: 5]  |
| [Document]       Documents                        |
| [Users]          Clients                          |
| [Calendar]       Deadlines            [Badge: !]  |
|                                                   |
| --- TOOLS ---                                     |
| [Template]       Templates                        |
| [Search]         Search                           |
| [Report]         Reports                          |
|                                                   |
+--------------------------------------------------+
| [Avatar]   John Smith                 [Settings]  |
|            Partner                    [Logout]    |
+--------------------------------------------------+
```

### Sidebar States

```
EXPANDED:     w-64 (256px), full labels visible
COLLAPSED:    w-16 (64px), icons only, tooltips on hover
MOBILE:       Full overlay, slide-in from left
```

### Nav Item States

```
+-- DEFAULT -----------------------------------------------+
| bg: transparent | text: neutral-400 | icon: neutral-400 |
+---------------------------------------------------------+

+-- HOVER -------------------------------------------------+
| bg: primary-950/50 | text: neutral-100                   |
+---------------------------------------------------------+

+-- ACTIVE (current page) ---------------------------------+
| bg: primary-500 | text: white                            |
| left-border: 3px primary-300 (indicator)                 |
+---------------------------------------------------------+

+-- FOCUS -------------------------------------------------+
| ring: 2px primary-400/50 inset                           |
+---------------------------------------------------------+
```

### Breadcrumb Anatomy

```
Dashboard  >  Matters  >  Smith Residence  >  Documents
    ^            ^              ^                ^
    |            |              |                |
 Link (nav)  Link (nav)   Link (nav)      Current (no link)
```

### Accessibility Requirements

- Sidebar: `role="navigation"` with `aria-label="Main navigation"`
- Current page: `aria-current="page"`
- Collapsed state: tooltips must be accessible
- Mobile: focus trap when open, Escape to close
- Skip link: "Skip to main content" as first focusable element

---

## 9. Alerts/Toasts

### Alert Anatomy (Inline)

```
+------------------------------------------------------------------+
| [Icon]  Alert title (optional)                              [X]  |
|         Alert message body explaining the situation.             |
|         [Action Link]                                            |
+------------------------------------------------------------------+
```

### Toast Anatomy (Floating)

```
+---------------------------------------------+
| [Icon]  Toast message            [X] [Undo] |
+---------------------------------------------+
```

### Variants

| Variant | Icon        | Color          | Use Case                    |
|---------|-------------|----------------|-----------------------------|
| Info    | Info circle | info-500       | General information         |
| Success | Checkmark   | success-500    | Action completed            |
| Warning | Warning tri | warning-500    | Needs attention             |
| Error   | X circle    | danger-500     | Action failed               |

### Toast Behavior

- Position: Top-right corner (default), stack vertically
- Auto-dismiss: 5 seconds (info/success), persistent (error/warning)
- Max visible: 3 toasts, queue additional
- Animation: Slide in from right, fade out

### Accessibility Requirements

- Alerts: `role="alert"` for urgent, `role="status"` for informational
- Toasts: `aria-live="polite"` for success, `aria-live="assertive"` for errors
- Dismissible: close button with `aria-label="Dismiss"`
- Don't auto-dismiss errors - user must acknowledge

---

## 10. Timeline

### Anatomy

```
+-- Today, Feb 2 ------------------------------------------+
|                                                          |
|  [o]---- Document uploaded: Purchase Agreement           |
|          2:30 PM by Sarah Johnson                        |
|                                                          |
|  [o]---- Title commitment received                       |
|          11:15 AM - Automated                            |
|                                                          |
+-- Feb 1 ------------------------------------------------+
|                                                          |
|  [o]---- Matter created                                  |
|          9:00 AM by John Smith                           |
|                                                          |
+----------------------------------------------------------+
```

### Item States

```
+-- COMPLETED ---------------------------------------------+
| Node: success-500 filled circle                          |
| Line: neutral-300 solid                                  |
+---------------------------------------------------------+

+-- CURRENT -----------------------------------------------+
| Node: primary-500 filled with pulse animation            |
| Line: primary-300 dashed (to next)                       |
+---------------------------------------------------------+

+-- UPCOMING ----------------------------------------------+
| Node: neutral-300 hollow circle                          |
| Line: neutral-200 dashed                                 |
+---------------------------------------------------------+

+-- OVERDUE -----------------------------------------------+
| Node: danger-500 filled                                  |
| Content: danger-500 text                                 |
+---------------------------------------------------------+
```

### Responsive Behavior

```
Desktop:  Alternating left/right layout
Tablet:   Single column, left-aligned
Mobile:   Compact single column, date headers sticky
```

---

## 11. Progress Indicators

### Pipeline/Stepper

```
[Intake]----[Contract]----[Due Diligence]----[Title]----[Closing]
   *             *               o               o           o
   ^             ^               ^
Completed    Current         Upcoming

*  = Filled circle (complete)
o  = Hollow circle (pending)
```

### Progress Bar

```
Transaction Progress: 60%
[==================================                         ]
         ^                                        ^
    Filled portion (primary-500)           Empty (neutral-200)
```

### Circular Progress

```
     ___
   /     \
  |  75%  |
   \ ___ /

Used for: AI confidence, completion percentage
```

### Loading States

```
SKELETON:
+----------------------------------------------------------+
| [====                                               ]     |
| [====================                               ]     |
| [============                                       ]     |
+----------------------------------------------------------+
Animated shimmer left-to-right, 1.5s duration

SPINNER:
[rotating circle] Loading...
Used for: Button loading, async operations

PROGRESS:
Uploading document... 45%
[======================                               ]
Used for: File uploads, long operations with known duration
```

---

## 12. Document Viewer

### Anatomy

```
+------------------------------------------------------------------+
| [Back] Document Name.pdf                    [Download] [Print]   |
+------------------------------------------------------------------+
|                                                                   |
| Toolbar:                                                          |
| [<] Page 3 of 12 [>]    [Zoom -][100%][Zoom +]    [Fit] [Search] |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                                                            |  |
|  |                                                            |  |
|  |                    DOCUMENT CONTENT                        |  |
|  |                                                            |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
| [Annotations Panel]  [AI Analysis Panel]                          |
+------------------------------------------------------------------+
```

### Annotation Layer

```
+-- HIGHLIGHT ---------------------------------------------+
| bg: warning-200/50 | border: warning-400 dashed          |
| Shows on hover: note icon with comment count             |
+---------------------------------------------------------+

+-- COMMENT MARKER ----------------------------------------+
| 24px circle at margin | count badge                       |
| Click to expand comment thread                           |
+---------------------------------------------------------+

+-- AI EXTRACTION -----------------------------------------+
| bg: info-100/50 | border: info-400                       |
| Tooltip: "AI extracted: [field name]"                    |
+---------------------------------------------------------+
```

### Accessibility Requirements

- Keyboard navigation for pages and zoom
- Screen reader announces page changes
- Alternative text access for document content
- High contrast mode support

---

## 13. AI Components

### AI Confidence Indicator

```
+----------------------------------------------------------+
| AI Analysis Results                    Confidence: HIGH   |
|                                        [====] 94%         |
+----------------------------------------------------------+
|                                                           |
| [i] This analysis was generated by AI. Review before use. |
|     Last updated: Feb 2, 2026 at 2:30 PM                 |
|                                                           |
| Findings:                                                 |
| * Risk item 1 with explanation                           |
| * Risk item 2 with explanation                           |
|                                                           |
| [Approve Analysis]  [Request Human Review]  [Regenerate] |
+----------------------------------------------------------+
```

### Confidence Level Display

| Level   | Score     | Color           | Icon          | Action Required       |
|---------|-----------|-----------------|---------------|-----------------------|
| High    | 90-100%   | success-500     | Check shield  | Optional review       |
| Medium  | 70-89%    | warning-500     | Warning       | Recommended review    |
| Low     | <70%      | danger-500      | Alert         | Mandatory review      |

### AI Suggestion Card

```
+----------------------------------------------------------+
| [Sparkle Icon]  AI Suggestion                             |
+----------------------------------------------------------+
|                                                           |
| Based on the contract, the inspection period ends on      |
| February 15, 2026. Would you like to create a deadline?   |
|                                                           |
| [Accept and Create Deadline]  [Dismiss]  [Edit First]    |
+----------------------------------------------------------+
```

### AI Status HUD (Explainable UI)

```
+----------------------------------------------------------+
| AI Processing Status                                      |
+----------------------------------------------------------+
| Document: Title_Commitment.pdf                            |
|                                                           |
| [*] Text extraction complete                              |
| [*] Entity recognition complete                           |
| [>] Exception analysis in progress...                     |
| [ ] Risk assessment pending                               |
| [ ] Summary generation pending                            |
|                                                           |
| Elapsed: 12s | Est. remaining: 8s                        |
+----------------------------------------------------------+
```

### Accessibility Requirements

- AI-generated content MUST be clearly labeled
- Confidence indicators: don't rely on color alone
- Screen readers must announce AI status updates
- All AI suggestions must have clear accept/reject controls

---

## Component Implementation Checklist

For each component, developers must verify:

- [ ] All states implemented (default, hover, focus, active, disabled, loading, error)
- [ ] Keyboard navigation functional
- [ ] Screen reader tested (NVDA, VoiceOver)
- [ ] Focus ring visible (no outline removal without replacement)
- [ ] Color contrast passes WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Responsive behavior at all breakpoints
- [ ] Reduced motion preference respected
- [ ] RTL layout support (if internationalization planned)
- [ ] Dark mode tokens applied

---

*End of Component Specifications*
