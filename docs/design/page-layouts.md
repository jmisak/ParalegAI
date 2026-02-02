# IRONCLAD Page Layouts

**Version**: 1.0.0
**Last Updated**: 2026-02-02
**Framework**: Next.js 15 App Router with React Server Components

---

## Table of Contents

1. [Layout System Overview](#1-layout-system-overview)
2. [Shell/Frame Layout](#2-shellframe-layout)
3. [Dashboard Layout](#3-dashboard-layout)
4. [Matter Detail Layout](#4-matter-detail-layout)
5. [Document Viewer Layout](#5-document-viewer-layout)
6. [Client Portal Layout](#6-client-portal-layout)
7. [Search Results Layout](#7-search-results-layout)
8. [Settings Layout](#8-settings-layout)
9. [Responsive Breakpoints](#9-responsive-breakpoints)

---

## 1. Layout System Overview

### Grid System

```
12-column grid with 24px gutters
Max content width: 1440px (centered)
Minimum margin: 16px (mobile), 24px (tablet), 32px (desktop)
```

### Layout Hierarchy

```
<RootLayout>                    <- Theme, fonts, providers
  <AuthLayout>                  <- Auth state, session
    <ShellLayout>               <- Sidebar, header, main area
      <PageLayout>              <- Page-specific structure
        <ContentSections>       <- Actual page content
      </PageLayout>
    </ShellLayout>
  </AuthLayout>
</RootLayout>
```

---

## 2. Shell/Frame Layout

The persistent application frame wrapping all authenticated pages.

### Desktop Layout (1280px+)

```
+--------+----------------------------------------------------------+
|        |  [Breadcrumb]                    [Search] [Bell] [Avatar]|
|        +----------------------------------------------------------+
|   S    |                                                          |
|   I    |                                                          |
|   D    |                                                          |
|   E    |                    MAIN CONTENT AREA                     |
|   B    |                                                          |
|   A    |                    (Page-specific layout)                |
|   R    |                                                          |
|        |                                                          |
|  64px  |                                                          |
|   or   |                                                          |
| 256px  |                                                          |
|        +----------------------------------------------------------+
+--------+----------------------------------------------------------+

Sidebar: Collapsible (64px collapsed, 256px expanded)
Header:  Fixed height 64px
Main:    Flexible, scrollable
```

### Tablet Layout (768px - 1279px)

```
+------------------------------------------------------------------+
|  [Menu]  IRONCLAD             [Search] [Bell] [Avatar]           |
+------------------------------------------------------------------+
|                                                                   |
|                                                                   |
|                      MAIN CONTENT AREA                            |
|                                                                   |
|                      (Full width, padded)                         |
|                                                                   |
+------------------------------------------------------------------+

Sidebar: Hidden by default, overlay on menu click
Header:  Fixed, 56px height
```

### Mobile Layout (<768px)

```
+--------------------------------------+
| [Menu]  IRONCLAD            [Bell]   |
+--------------------------------------+
|                                      |
|                                      |
|          MAIN CONTENT                |
|                                      |
|          (Full width)                |
|                                      |
|                                      |
+--------------------------------------+
|  [Home] [Matters] [Docs] [More]     |
+--------------------------------------+

Header:    Fixed, 48px
Bottom Nav: Fixed, 56px
Main:      Scrollable, accounts for both bars
```

### ASCII Component Detail

```
HEADER ANATOMY:
+------------------------------------------------------------------+
|                                                                   |
| [<<] Dashboard > Matters > Smith Residence    |  [O] [Bell(3)] [@]|
|  ^                 ^                          |   ^      ^      ^  |
|  |                 |                          |   |      |      |  |
| Collapse      Breadcrumb                    Search  Notif  Profile|
|                                                                   |
+------------------------------------------------------------------+
Height: 64px
Border-bottom: 1px neutral-200
Background: white (light) / neutral-900 (dark)
```

---

## 3. Dashboard Layout

The primary landing page after login.

### Desktop Wireframe

```
+------------------------------------------------------------------+
| Good morning, John                           Today: Feb 2, 2026   |
+------------------------------------------------------------------+
|                                                                   |
| +------------------------+  +------------------------+            |
| |  MATTERS OVERVIEW      |  |  UPCOMING DEADLINES    |            |
| |                        |  |                        |            |
| |  Active:    24         |  |  Today:     3          |            |
| |  Pending:   8          |  |  This Week: 12         |            |
| |  Closing:   5          |  |  Overdue:   1 [!]      |            |
| |                        |  |                        |            |
| |  [View All Matters ->] |  |  [View Calendar ->]    |            |
| +------------------------+  +------------------------+            |
|                                                                   |
| +----------------------------------------------------------------+|
| |  RECENT MATTERS                                    [+ New]     ||
| +----------------------------------------------------------------+|
| |  Status   | Matter Name          | Client      | Closing   |   ||
| |  [Active] | Smith Residence      | Smith, J    | Feb 15    |   ||
| |  [Active] | Johnson Commercial   | Johnson LLC | Feb 28    |   ||
| |  [Pending]| Williams Refinance   | Williams, T | TBD       |   ||
| |  [Closing]| Martinez Purchase    | Martinez, M | Feb 5     |   ||
| +----------------------------------------------------------------+|
|                                                                   |
| +------------------------------+  +------------------------------+|
| |  TASKS ASSIGNED TO YOU       |  |  RECENT ACTIVITY             ||
| +------------------------------+  +------------------------------+|
| |                              |  |                              ||
| |  [ ] Review title commit...  |  |  [o] Doc uploaded - 10m ago  ||
| |      Due: Today              |  |  [o] Task completed - 1h ago ||
| |                              |  |  [o] Matter created - 2h ago ||
| |  [ ] Draft closing docs      |  |  [o] Client message - 3h ago ||
| |      Due: Feb 5              |  |                              ||
| |                              |  |  [View All Activity ->]      ||
| |  [View All Tasks ->]         |  |                              ||
| +------------------------------+  +------------------------------+|
|                                                                   |
+------------------------------------------------------------------+
```

### Grid Specification

```
Desktop (1280px+):
- Top row: 2 stat cards, 6 columns each
- Middle row: Table spanning 12 columns
- Bottom row: 2 cards, 6 columns each
- Gap: 24px

Tablet (768-1279px):
- Top row: 2 stat cards, 6 columns each
- Middle row: Table spanning 12 columns
- Bottom row: Stack vertically, 12 columns each
- Gap: 16px

Mobile (<768px):
- All cards stack vertically
- Full width (minus padding)
- Gap: 16px
```

### Dashboard Widget Specifications

```
STAT CARD:
+------------------------+
|  [Icon]                |
|                        |
|  Label              24 |
|  Secondary text        |
|                        |
|  [Link Text ->]        |
+------------------------+
Min-height: 160px
Padding: 24px
```

---

## 4. Matter Detail Layout

The comprehensive view for a single matter/case.

### Desktop Wireframe

```
+------------------------------------------------------------------+
| [<- Back to Matters]                                              |
|                                                                   |
| Smith Residence Purchase                              [Active]    |
| 123 Main Street, Springfield, IL 62701                           |
+------------------------------------------------------------------+
|                                                                   |
| [Overview] [Documents] [Parties] [Timeline] [Tasks] [Billing]    |
|  ^^^^^^^                                                          |
| Active tab indicator                                              |
+------------------------------------------------------------------+
|                                                                   |
| +---------------------------+  +--------------------------------+ |
| |  TRANSACTION DETAILS      |  |  KEY DATES                     | |
| +---------------------------+  +--------------------------------+ |
| |                           |  |                                | |
| |  Type: Residential Purch  |  |  Contract:     Jan 15, 2026   | |
| |  Role: Buyer Rep          |  |  Inspection:   Jan 25, 2026   | |
| |  Purchase Price: $425,000 |  |  Financing:    Feb 1, 2026    | |
| |  Earnest: $10,000         |  |  Closing:      Feb 15, 2026   | |
| |                           |  |                                | |
| |  [Edit Details]           |  |  [Manage Deadlines]           | |
| +---------------------------+  +--------------------------------+ |
|                                                                   |
| +----------------------------------------------------------------+|
| |  PIPELINE PROGRESS                                             ||
| +----------------------------------------------------------------+|
| |                                                                ||
| | [*]------[*]------[*]------[o]------[o]------[o]------[o]     ||
| | Intake  Contract  Due Dil  Title   Pre-Close Closing  Post    ||
| |                    ^                                           ||
| |                 Current                                        ||
| +----------------------------------------------------------------+|
|                                                                   |
| +--------------------------------+  +---------------------------+ |
| |  RECENT DOCUMENTS              |  |  ASSIGNED TASKS           | |
| +--------------------------------+  +---------------------------+ |
| |                                |  |                           | |
| |  [PDF] Purchase Agreement      |  |  [ ] Review title...      | |
| |        Uploaded Jan 16         |  |      Due: Today  @Sarah   | |
| |                                |  |                           | |
| |  [PDF] Title Commitment        |  |  [ ] Order survey         | |
| |        Uploaded Feb 1          |  |      Due: Feb 3   @John   | |
| |                                |  |                           | |
| |  [View All Documents ->]       |  |  [+ Add Task]             | |
| +--------------------------------+  +---------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Tab Content Areas

```
DOCUMENTS TAB:
+------------------------------------------------------------------+
| Documents                               [Upload] [Generate] [+]   |
+------------------------------------------------------------------+
| Filter: [All Types v] [All Status v]              Search: [    ] |
+------------------------------------------------------------------+
| +-----+------------------------------------------------+---------+|
| | [ ] | Name                    | Type    | Uploaded   | Actions ||
| +-----+------------------------------------------------+---------+|
| | [ ] | Purchase_Agreement.pdf  | Contract| Jan 16     | [...] ||
| | [ ] | Title_Commitment.pdf    | Title   | Feb 1      | [...] ||
| | [ ] | Survey_Report.pdf       | Survey  | Feb 2      | [...] ||
| +-----+------------------------------------------------+---------+|

PARTIES TAB:
+------------------------------------------------------------------+
| Parties                                              [+ Add Party]|
+------------------------------------------------------------------+
|                                                                   |
| BUYERS                           SELLERS                          |
| +------------------------+       +------------------------+       |
| | John Smith            |       | Robert Johnson         |       |
| | jane.smith@email.com  |       | robert.j@email.com     |       |
| | (555) 123-4567        |       | (555) 987-6543         |       |
| | [Edit] [Message]      |       | [Edit] [Message]       |       |
| +------------------------+       +------------------------+       |
|                                                                   |
| PROFESSIONALS                                                     |
| +------------------------+  +------------------------+            |
| | First Title Company   |  | ABC Mortgage           |            |
| | Title Company         |  | Lender                 |            |
| | sarah@firsttitle.com  |  | loans@abcmortgage.com  |            |
| +------------------------+  +------------------------+            |
|                                                                   |
+------------------------------------------------------------------+

TIMELINE TAB:
+------------------------------------------------------------------+
| Timeline                                     [Filter] [Export]    |
+------------------------------------------------------------------+
|                                                                   |
| +-- Today, Feb 2 ----------------------------------------------+ |
| |                                                               | |
| |  2:30 PM  [o]---- Title commitment uploaded                  | |
| |                   by System (automated)                       | |
| |                                                               | |
| +-- Feb 1 -----------------------------------------------------+ |
| |                                                               | |
| |  4:15 PM  [o]---- Inspection report reviewed                 | |
| |                   by Sarah Johnson                            | |
| |                                                               | |
| |  9:00 AM  [o]---- Inspection contingency satisfied           | |
| |                   by John Smith                               | |
| |                                                               | |
| +-- Jan 25 ----------------------------------------------------+ |
| |                                                               | |
| |  11:30 AM [o]---- Inspection completed                       | |
| |                   by ABC Inspections                          | |
| |                                                               | |
| +---------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Responsive Behavior

```
Desktop (1280px+):
- Two-column layout for cards
- Full tab bar visible
- Pipeline shown horizontally

Tablet (768-1279px):
- Single column for cards
- Tab bar scrollable horizontally
- Pipeline shown horizontally (compact)

Mobile (<768px):
- Single column, full width
- Tabs become dropdown selector
- Pipeline becomes vertical stepper
```

---

## 5. Document Viewer Layout

Full-screen document viewing and annotation interface.

### Desktop Wireframe

```
+------------------------------------------------------------------+
| [<- Back]  Purchase_Agreement.pdf              [Download] [Print]|
+------------------------------------------------------------------+
| [<] Page 3 of 12 [>]   [-] 100% [+]   [Fit]   [Search]   [Menu] |
+------------------------------------------------------------------+
|                                                |                  |
|                                                |  AI ANALYSIS     |
|                                                |  Confidence: 94% |
|                                                |                  |
|   +--------------------------------------+    |  Key Findings:   |
|   |                                      |    |  * Purchase price|
|   |                                      |    |    $425,000      |
|   |          DOCUMENT PREVIEW            |    |  * Closing date  |
|   |                                      |    |    Feb 15, 2026  |
|   |          (PDF/Image Render)          |    |  * Contingencies |
|   |                                      |    |    - Financing   |
|   |                                      |    |    - Inspection  |
|   |                                      |    |                  |
|   |                                      |    |  [Extract All]   |
|   |                                      |    |                  |
|   +--------------------------------------+    |  ANNOTATIONS (3) |
|                                                |                  |
|                                                |  [+] Page 2: ... |
|                                                |  [+] Page 5: ... |
|                                                |  [+] Page 8: ... |
|                                                |                  |
|                                                |  [Add Note]      |
+------------------------------------------------------------------+
```

### Panel Specifications

```
DOCUMENT AREA:
- Min-width: 600px
- Flexible width based on sidebar state
- Scrollable (both axes for large documents)
- Background: neutral-100 (to frame white document)

AI/ANNOTATION SIDEBAR:
- Fixed width: 320px
- Collapsible on tablet
- Hidden by default on mobile (toggle to show)
- Scrollable content area
```

### Toolbar Anatomy

```
+------------------------------------------------------------------+
| [<]  Page [3] of 12  [>]  |  [-] [100%] [+]  |  [Fit] [W] [H]    |
+------------------------------------------------------------------+
    ^                            ^                    ^
    |                            |                    |
  Pagination               Zoom controls         Fit options
                                              (Page/Width/Height)
```

### Mobile Document View

```
+--------------------------------------+
| [<-]  Agreement.pdf          [...]   |
+--------------------------------------+
|                                      |
|                                      |
|        DOCUMENT PREVIEW              |
|        (Full screen, pinch zoom)     |
|                                      |
|                                      |
+--------------------------------------+
| [<] 3/12 [>]  [Zoom]  [AI]  [Notes] |
+--------------------------------------+

Bottom toolbar: 56px fixed
AI/Notes: Full-screen overlay when activated
```

---

## 6. Client Portal Layout

Simplified interface for external clients.

### Desktop Wireframe

```
+------------------------------------------------------------------+
|                                                                   |
|  [Firm Logo]                         Welcome, John   [Logout]    |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| +----------------------------------------------------------------+|
| |                                                                ||
| |  Your Transaction: Smith Residence Purchase                    ||
| |  123 Main Street, Springfield, IL 62701                        ||
| |                                                                ||
| +----------------------------------------------------------------+|
|                                                                   |
| +----------------------------------------------------------------+|
| |  PROGRESS                                                      ||
| |                                                                ||
| |  [*]========[*]========[*]========[o]--------[o]--------[o]   ||
| |  Contract   Inspections  Financing   Title    Closing   Done  ||
| |              Complete                  ^                       ||
| |                                    Current                     ||
| +----------------------------------------------------------------+|
|                                                                   |
| +------------------------------+  +------------------------------+|
| |  ACTION ITEMS                |  |  MESSAGES                    ||
| +------------------------------+  +------------------------------+|
| |                              |  |                              ||
| |  [!] Upload proof of         |  |  Sarah Johnson - 2h ago     ||
| |      homeowner's insurance   |  |  "The title commitment..."   ||
| |      Due: Feb 10             |  |                              ||
| |                              |  |  [Reply]                     ||
| |  [!] Sign closing disclosure |  |                              ||
| |      Due: Feb 12             |  +------------------------------+|
| |                              |                                  |
| |  [Upload Document]           |                                  |
| +------------------------------+                                  |
|                                                                   |
| +----------------------------------------------------------------+|
| |  DOCUMENTS                                         [View All]  ||
| +----------------------------------------------------------------+|
| |                                                                ||
| |  [PDF] Purchase Agreement          Signed Jan 15    [Download] ||
| |  [PDF] Inspection Report           Uploaded Jan 25  [Download] ||
| |  [PDF] Title Commitment            Uploaded Feb 1   [Download] ||
| |                                                                ||
| +----------------------------------------------------------------+|
|                                                                   |
+------------------------------------------------------------------+
|  Questions? Contact your legal team at (555) 123-4567            |
+------------------------------------------------------------------+
```

### Design Principles for Client Portal

1. **Simplified Navigation**: No sidebar, minimal options
2. **Clear Status**: Progress always visible
3. **Action-Oriented**: Pending items prominently displayed
4. **Trust Signals**: Firm branding, secure indicators
5. **Mobile-First**: Clients often access from phones

### Mobile Client Portal

```
+--------------------------------------+
| [Firm Logo]                  [Menu]  |
+--------------------------------------+
|                                      |
|  Smith Residence Purchase            |
|  123 Main Street                     |
|                                      |
+--------------------------------------+
|  Progress: Financing                 |
|  [=========>               ] 60%     |
+--------------------------------------+
|                                      |
|  ACTION REQUIRED (2)                 |
|                                      |
|  +--------------------------------+  |
|  | [!] Upload insurance proof    |  |
|  |     Due: Feb 10               |  |
|  |     [Upload Now]              |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  | [!] Sign closing disclosure   |  |
|  |     Due: Feb 12               |  |
|  |     [Sign Now]                |  |
|  +--------------------------------+  |
|                                      |
+--------------------------------------+
| [Home] [Docs] [Messages] [Contact]  |
+--------------------------------------+
```

---

## 7. Search Results Layout

Global search and filtered results interface.

### Desktop Wireframe

```
+------------------------------------------------------------------+
| [Back]           Search: "smith property"              [X Clear] |
+------------------------------------------------------------------+
|                                                                   |
| FILTERS                        | RESULTS (24 found)              |
|                                |                                  |
| Type                           | Sort: [Relevance v]             |
| [ ] Matters (12)               |                                  |
| [ ] Documents (8)              | +------------------------------+ |
| [ ] Clients (3)                | | [MATTER]                     | |
| [ ] Contacts (1)               | | Smith Residence Purchase     | |
|                                | | 123 Main St, Springfield     | |
| Status                         | | Active | Closing: Feb 15     | |
| [ ] Active (10)                | +------------------------------+ |
| [ ] Closed (14)                |                                  |
|                                | +------------------------------+ |
| Date Range                     | | [DOCUMENT]                   | |
| [Jan 1, 2026] - [Today]        | | Smith_Purchase_Agreement.pdf | |
|                                | | In: Smith Residence Purchase | |
| Assigned To                    | | Uploaded: Jan 16, 2026       | |
| [Select users...]              | +------------------------------+ |
|                                |                                  |
| [Clear Filters]                | +------------------------------+ |
|                                | | [CLIENT]                     | |
|                                | | John Smith                   | |
|                                | | john.smith@email.com         | |
|                                | | 3 active matters             | |
|                                | +------------------------------+ |
|                                |                                  |
|                                | [Load More Results]              |
+------------------------------------------------------------------+
```

### Filter Panel Behavior

```
Desktop:  Fixed left sidebar, 280px width
Tablet:   Collapsible, toggle button
Mobile:   Full-screen overlay, "Filter" button at top
```

### Result Card Variants

```
MATTER RESULT:
+------------------------------------------+
| [Briefcase Icon]              [Active]   |
| Matter Name                              |
| Property address or description          |
| Client: Name | Closing: Date             |
+------------------------------------------+

DOCUMENT RESULT:
+------------------------------------------+
| [Document Icon]  [PDF Badge]             |
| Document Name.pdf                        |
| In Matter: Matter Name                   |
| Uploaded: Date | By: User                |
+------------------------------------------+

CLIENT RESULT:
+------------------------------------------+
| [Avatar]                                 |
| Client Name                              |
| email@address.com                        |
| X active matters                         |
+------------------------------------------+
```

---

## 8. Settings Layout

User and organization configuration interface.

### Desktop Wireframe

```
+------------------------------------------------------------------+
| Settings                                                          |
+------------------------------------------------------------------+
|                                                                   |
| +-----------------+  +------------------------------------------+ |
| |                 |  |                                          | |
| |  PERSONAL       |  |  Profile                                 | |
| |  [*] Profile    |  |                                          | |
| |  [ ] Security   |  |  +------------------+                    | |
| |  [ ] Notifs     |  |  |    [Avatar]      |   [Change Photo]   | |
| |                 |  |  +------------------+                    | |
| |  ORGANIZATION   |  |                                          | |
| |  [ ] General    |  |  Name                                    | |
| |  [ ] Users      |  |  +------------------------------------+  | |
| |  [ ] Roles      |  |  | John Smith                         |  | |
| |  [ ] Billing    |  |  +------------------------------------+  | |
| |  [ ] Integ.     |  |                                          | |
| |                 |  |  Email                                   | |
| |  SYSTEM         |  |  +------------------------------------+  | |
| |  [ ] Templates  |  |  | john.smith@lawfirm.com             |  | |
| |  [ ] Workflows  |  |  +------------------------------------+  | |
| |  [ ] AI Config  |  |                                          | |
| |                 |  |  Title                                   | |
| +-----------------+  |  +------------------------------------+  | |
|                      |  | Partner                            |  | |
|                      |  +------------------------------------+  | |
|                      |                                          | |
|                      |                    [Cancel] [Save Changes]| |
|                      +------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Settings Navigation

```
Desktop:  Fixed left sidebar, 240px
Tablet:   Same, narrower (200px)
Mobile:   Top dropdown selector, content below
```

---

## 9. Responsive Breakpoints

### Breakpoint Reference

| Name   | Min-Width | Typical Device         |
|--------|-----------|------------------------|
| xs     | 0         | Small phones           |
| sm     | 640px     | Large phones           |
| md     | 768px     | Tablets (portrait)     |
| lg     | 1024px    | Tablets (landscape)    |
| xl     | 1280px    | Desktops               |
| 2xl    | 1536px    | Large desktops         |

### Layout Behavior Matrix

| Component           | xs-sm      | md          | lg          | xl-2xl      |
|---------------------|------------|-------------|-------------|-------------|
| Sidebar             | Hidden     | Overlay     | Collapsed   | Expanded    |
| Header              | Compact    | Standard    | Standard    | Standard    |
| Bottom Nav          | Visible    | Hidden      | Hidden      | Hidden      |
| Grid Columns        | 1          | 2           | 2-3         | 3-4         |
| Table               | Cards      | Scroll      | Full        | Full        |
| Document Viewer     | Full       | Full+Toggle | Split       | Split       |
| Search Filters      | Overlay    | Collapsible | Visible     | Visible     |
| Modal Width         | Full       | 90%         | 512px       | 512px       |

### Container Padding

```css
.container {
  padding-left: 16px;   /* xs-sm */
  padding-right: 16px;

  @media (min-width: 768px) {
    padding-left: 24px;
    padding-right: 24px;
  }

  @media (min-width: 1280px) {
    padding-left: 32px;
    padding-right: 32px;
  }
}
```

### Touch Target Requirements

```
Minimum touch target: 44x44px (iOS/Android guidelines)
Minimum spacing between targets: 8px
Applied to: Buttons, links, checkboxes, interactive elements
```

---

## Layout Implementation Checklist

For each page layout, verify:

- [ ] Mobile-first implementation
- [ ] All breakpoints tested
- [ ] Sidebar state persistence (localStorage)
- [ ] Focus management on navigation
- [ ] Loading states for async regions
- [ ] Error boundaries for content sections
- [ ] Scroll restoration on back navigation
- [ ] Print styles defined
- [ ] Reduced motion preferences respected
- [ ] RTL layout support (if needed)

---

*End of Page Layouts Specification*
