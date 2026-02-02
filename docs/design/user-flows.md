# IRONCLAD User Flows

**Version**: 1.0.0
**Last Updated**: 2026-02-02
**Notation**: State diagrams use ASCII flow notation

---

## Table of Contents

1. [Matter Creation Flow](#1-matter-creation-flow)
2. [Document Upload and Processing Flow](#2-document-upload-and-processing-flow)
3. [Client Communication Flow](#3-client-communication-flow)
4. [Deadline Management Flow](#4-deadline-management-flow)
5. [Search and Filter Patterns](#5-search-and-filter-patterns)
6. [Document Generation Flow](#6-document-generation-flow)
7. [AI Analysis Flow](#7-ai-analysis-flow)
8. [Client Portal Onboarding Flow](#8-client-portal-onboarding-flow)

---

## 1. Matter Creation Flow

### Overview
Creating a new matter (case) involves intake, conflict checking, party setup, and initial configuration.

### Flow Diagram

```
+----------------+
|    START       |
| (Dashboard or  |
|  Matters List) |
+-------+--------+
        |
        v
+-------+--------+
| Click "+ New   |
|    Matter"     |
+-------+--------+
        |
        v
+-------+--------+
| SELECT MATTER  |
|     TYPE       |
| - Residential  |
| - Commercial   |
| - Refinance    |
| - Other...     |
+-------+--------+
        |
        v
+-------+--------+     +------------------+
| ENTER BASIC    |     |                  |
|   DETAILS      |     |  CONFLICT CHECK  |
| - Matter name  +---->+  (Automatic)     |
| - Property     |     |                  |
| - Trans. type  |     +--------+---------+
+----------------+              |
                                v
                    +-----------+-----------+
                    |    Conflicts Found?   |
                    +-----------+-----------+
                           |           |
                      No   |           | Yes
                           v           v
              +------------+---+   +---+------------+
              |   CONTINUE     |   | CONFLICT       |
              |                |   | RESOLUTION     |
              +-------+--------+   | MODAL          |
                      |            | - Review hits  |
                      |            | - Waive/Block  |
                      |            +-------+--------+
                      |                    |
                      |<-------------------+
                      |     (If waived)
                      v
              +-------+--------+
              |  ADD PARTIES   |
              | - Buyer(s)     |
              | - Seller(s)    |
              | - Agents       |
              | - Lender       |
              +-------+--------+
                      |
                      v
              +-------+--------+
              |  KEY DATES     |
              | - Contract     |
              | - Closing      |
              | - Contingency  |
              +-------+--------+
                      |
                      v
              +-------+--------+
              |   ASSIGN       |
              | - Lead atty    |
              | - Paralegal    |
              | - Team members |
              +-------+--------+
                      |
                      v
              +-------+--------+
              |    REVIEW &    |
              |    CREATE      |
              +-------+--------+
                      |
                      v
              +-------+--------+     +------------------+
              |  MATTER        |     |  AUTOMATED       |
              |  CREATED       +---->+  - Deadline calc |
              |                |     |  - Task gen      |
              +-------+--------+     |  - Notifications |
                      |              +------------------+
                      v
              +-------+--------+
              |  REDIRECT TO   |
              | MATTER DETAIL  |
              +----------------+
                    END
```

### Screen Sequence

| Step | Screen | Key Components |
|------|--------|----------------|
| 1 | Matter Type Selector | Card grid with matter type options |
| 2 | Basic Details Form | Text inputs, address autocomplete |
| 3 | Conflict Results | Table of potential conflicts, severity badges |
| 4 | Party Management | Contact search, quick-add forms |
| 5 | Date Configuration | Date pickers, deadline calculator |
| 6 | Assignment | User multi-select, role dropdown |
| 7 | Review Summary | Read-only preview, edit links |
| 8 | Confirmation | Success message, next steps |

### Error Handling

| Error | Handling |
|-------|----------|
| Conflict check fails | Show error toast, allow retry |
| Required party missing | Inline validation, block progress |
| Invalid date sequence | Warning with suggestion |
| Duplicate matter detected | Warning modal with link to existing |

### Accessibility Notes

- All form steps keyboard navigable
- Progress indicator announces current step to screen readers
- Error messages associated with inputs via `aria-describedby`
- Focus management: auto-focus first field on each step

---

## 2. Document Upload and Processing Flow

### Overview
Documents uploaded to IRONCLAD undergo OCR, classification, and AI analysis.

### Flow Diagram

```
+----------------+
|    START       |
| (Matter Detail |
|  Documents Tab)|
+-------+--------+
        |
        v
+-------+--------+
|  UPLOAD        |
|  INTERFACE     |
| [Drag & Drop]  |
| [Browse Files] |
+-------+--------+
        |
        | Files Selected
        v
+-------+--------+
|  FILE PREVIEW  |
|  - Filename    |
|  - Size        |
|  - Type        |
|  [X] Remove    |
+-------+--------+
        |
        v
+-------+--------+
| CLASSIFICATION |
| (User Input)   |
| - Doc Type     |
| - Description  |
| - Tags         |
+-------+--------+
        |
        | Click "Upload"
        v
+-------+--------+
|  UPLOAD        |
|  PROGRESS      |
| [=========  ]  |
|    75%         |
+-------+--------+
        |
        | Upload Complete
        v
+-------+--------+
|  PROCESSING    |<------------------------------------+
|  QUEUE         |                                     |
| Status: Queued |                                     |
+-------+--------+                                     |
        |                                              |
        v                                              |
+-------+--------+                                     |
|  OCR           |                                     |
|  EXTRACTION    |                                     |
| Status:        |                                     |
| Processing...  |                                     |
+-------+--------+                                     |
        |                                              |
        v                                              |
+-------+--------+                                     |
|  AI ANALYSIS   |                                     |
| - Field detect |                                     |
| - Risk flags   |                                     |
| - Date extract |                                     |
+-------+--------+                                     |
        |                                              |
        v                                              |
+-------+--------+     +------------------+            |
|  ANALYSIS      |     |                  |            |
|  COMPLETE      +---->+ NOTIFICATION     |            |
|                |     | - In-app toast   |            |
| Confidence: 94%|     | - Optional email |            |
+-------+--------+     +------------------+            |
        |                                              |
        v                                              |
+-------+--------+                                     |
|  HUMAN REVIEW  |                                     |
|  REQUIRED?     |                                     |
+-------+--------+                                     |
    |         |                                        |
 No |         | Yes (Confidence < 70%)                 |
    v         v                                        |
+---+----+ +--+-------------+                          |
| AUTO   | | REVIEW QUEUE   |                          |
| ACCEPT | | - Flag for atty|                          |
+---+----+ | - Assign task  |                          |
    |      +-------+--------+                          |
    |              |                                   |
    |              v                                   |
    |      +-------+--------+                          |
    |      | REVIEWER       |                          |
    |      | APPROVES       |                          |
    |      +-------+--------+                          |
    |              |                                   |
    +<-------------+                                   |
    |                                                  |
    v                                                  |
+---+-------------+                                    |
| DOCUMENT        |                                    |
| AVAILABLE       |                                    |
| - Searchable    |                                    |
| - AI insights   |                                    |
| - Linked data   |                                    |
+-------+---------+                                    |
        |                                              |
        v                                              |
    +---+---+                                          |
    |  END  |                                          |
    +-------+                                          |
```

### Upload Interface States

```
EMPTY STATE:
+------------------------------------------+
|                                          |
|    [Cloud Upload Icon]                   |
|                                          |
|    Drag files here or click to browse    |
|                                          |
|    Supported: PDF, DOC, DOCX, JPG, PNG   |
|    Max size: 50MB per file               |
|                                          |
+------------------------------------------+

DRAGGING STATE:
+------------------------------------------+
|  +------------------------------------+  |
|  |                                    |  |
|  |   Drop files to upload             |  |
|  |   (Border: dashed, primary-500)    |  |
|  |                                    |  |
|  +------------------------------------+  |
+------------------------------------------+

FILES QUEUED:
+------------------------------------------+
|  [PDF] Contract_Draft.pdf     12 MB  [X] |
|  [DOC] Addendum.docx          2 MB   [X] |
|  +                                       |
|  [Add more files]                        |
|                                          |
|  [Cancel]              [Upload 2 Files]  |
+------------------------------------------+
```

### Processing Status Display

```
PROCESSING HUD (Explainable UI):
+------------------------------------------+
|  Document: Title_Commitment.pdf          |
+------------------------------------------+
|  [*] Upload complete                     |
|  [*] Virus scan passed                   |
|  [*] Text extraction (OCR)               |
|  [>] AI Analysis in progress...          |
|      - Identifying document type         |
|      - Extracting key fields             |
|  [ ] Indexing for search                 |
|  [ ] Linking to matter data              |
+------------------------------------------+
|  Time elapsed: 12s | Est. remaining: 8s  |
+------------------------------------------+
```

### Bulk Upload Handling

- Queue processing for multiple files
- Individual progress bars
- Ability to cancel individual files
- Summary notification when batch completes

---

## 3. Client Communication Flow

### Overview
Secure messaging between legal team and clients through the portal.

### Flow Diagram

```
+----------------+           +----------------+
|  LEGAL TEAM    |           |    CLIENT      |
| (Staff Portal) |           | (Client Portal)|
+-------+--------+           +-------+--------+
        |                            |
        v                            v
+-------+--------+           +-------+--------+
|  COMPOSE       |           |  VIEW INBOX    |
|  MESSAGE       |           |  Messages (3)  |
| - Select matter|           +-------+--------+
| - Add recipients           |
| - Write message|           |
| - Attach files |           v
+-------+--------+   +-------+--------+
        |            |  NOTIFICATION  |
        |            |  - Email       |
        |            |  - SMS (opt)   |
        v            |  - Push (opt)  |
+-------+--------+   +-------+--------+
|  SEND          |           |
+-------+--------+           v
        |            +-------+--------+
        |            |  CLIENT OPENS  |
        |            |  MESSAGE       |
        |            +-------+--------+
        |                    |
        |                    v
        |            +-------+--------+
        |            |  READ RECEIPT  |
        |            |  (Automatic)   |
        |            +-------+--------+
        |                    |
        |                    v
        |            +-------+--------+
        |            |  CLIENT REPLY  |
        |            |  OR            |
        |            |  DOCUMENT UPLOAD
        v            +-------+--------+
+-------+--------+           |
|  NOTIFICATION  |<----------+
|  - In-app      |
|  - Email       |
+-------+--------+
        |
        v
+-------+--------+
|  STAFF REVIEWS |
|  & RESPONDS    |
+----------------+
```

### Message Composer Interface

```
+--------------------------------------------------+
| New Message                               [X]    |
+--------------------------------------------------+
| Matter: [Smith Residence Purchase      v]        |
+--------------------------------------------------+
| To: [John Smith (Client)] [Jane Smith (Client)]  |
|     [+ Add Recipient]                            |
+--------------------------------------------------+
| Subject:                                         |
| [Title commitment received - action needed    ]  |
+--------------------------------------------------+
|                                                  |
| [Formatting toolbar: B I U | List | Link]        |
|                                                  |
| Hi John and Jane,                                |
|                                                  |
| We've received the title commitment for your     |
| property. Please review the attached summary...  |
|                                                  |
|                                                  |
+--------------------------------------------------+
| Attachments:                                     |
| [PDF] Title_Summary.pdf  120KB  [X]              |
| [+ Attach from Matter] [+ Upload New]            |
+--------------------------------------------------+
| [ ] Send copy to matter file                     |
| [ ] Request read receipt                         |
+--------------------------------------------------+
|                         [Save Draft]  [Send]     |
+--------------------------------------------------+
```

### Client Reply Flow

```
+-----------------------------------------------+
| From: Sarah Johnson, Paralegal                |
| Feb 2, 2026 at 2:30 PM                        |
+-----------------------------------------------+
|                                               |
| Hi John and Jane,                             |
|                                               |
| We've received the title commitment...        |
|                                               |
| [Attachments: Title_Summary.pdf]              |
|                                               |
+-----------------------------------------------+
| Your Reply:                                   |
+-----------------------------------------------+
|                                               |
| [Message input area...]                       |
|                                               |
+-----------------------------------------------+
| [+ Attach File]              [Send Reply]     |
+-----------------------------------------------+
```

### Communication Logging

All messages are automatically logged to the matter timeline with:
- Timestamp
- Sender/recipients
- Subject/preview
- Attachment references
- Read receipt status

---

## 4. Deadline Management Flow

### Overview
Creating, tracking, and managing critical transaction dates.

### Flow Diagram

```
+-------------------+
|      START        |
| (Matter created   |
|  OR manual add)   |
+---------+---------+
          |
          v
+---------+---------+
|  DEADLINE SOURCE  |
+---------+---------+
     |    |    |
     v    v    v
+----+  +-+--+ +----+
|AUTO|  |AI  | |MAN |
|CALC|  |EXT | |UAL |
+--+-+  +-+--+ +-+--+
   |      |      |
   +------+------+
          |
          v
+---------+---------+
|  DEADLINE DATA    |
| - Name            |
| - Date            |
| - Type            |
| - Calculation     |
| - Reminders       |
+---------+---------+
          |
          v
+---------+---------+
|  ADD TO CALENDAR  |
| - Internal        |
| - Google sync     |
| - Outlook sync    |
+---------+---------+
          |
          v
+-------------------+
|  REMINDER ENGINE  |
| (Background job)  |
+-------------------+
          |
    +-----+-----+
    |     |     |
    v     v     v
+---+ +---+ +---+
|7d | |3d | |1d |
+---+ +---+ +---+
    |     |     |
    v     v     v
+---------+---------+
|  NOTIFICATION     |
| - Email           |
| - In-app          |
| - SMS (optional)  |
+---------+---------+
          |
          v
+---------+---------+    +-----------------+
|  DEADLINE         |    |                 |
|  APPROACHING      +--->+  USER ACTIONS   |
|                   |    | - Mark complete |
+---------+---------+    | - Extend date   |
          |              | - Add note      |
          v              +-----------------+
+---------+---------+
|  DATE PASSES      |
+---------+---------+
     |         |
     v         v
+----+----+ +--+-------+
|COMPLETED| |OVERDUE   |
|  (Green)| | (Red)    |
+---------+ +--+-------+
               |
               v
         +-----+------+
         | ESCALATION |
         | - Alert    |
         | - Manager  |
         +------------+
```

### Deadline Types

| Type | Calculation | Example |
|------|-------------|---------|
| Fixed | Specific date | Closing: Feb 15, 2026 |
| Relative | X days from trigger | Inspection: 10 days from contract |
| Business Days | X business days | TRID: 3 business days before closing |
| Contingent | If condition met | Financing: 30 days OR waiver |

### Deadline Management Interface

```
DEADLINE LIST VIEW:
+------------------------------------------------------------------+
| Deadlines for Smith Residence                  [+ Add Deadline]  |
+------------------------------------------------------------------+
| Filter: [All v]  [Upcoming v]           Sort: [Date (Asc) v]     |
+------------------------------------------------------------------+
|                                                                   |
| +-- OVERDUE --------------------------------------------------+  |
| |  [!] Inspection contingency        Due: Jan 30   [-2 days]  |  |
| |      Status: Awaiting response     [Mark Complete] [Extend] |  |
| +-------------------------------------------------------------+  |
|                                                                   |
| +-- THIS WEEK ------------------------------------------------+  |
| |  [ ] Title objection deadline      Due: Feb 4    [2 days]   |  |
| |  [ ] Survey completion             Due: Feb 5    [3 days]   |  |
| +-------------------------------------------------------------+  |
|                                                                   |
| +-- NEXT WEEK ------------------------------------------------+  |
| |  [ ] Financing contingency         Due: Feb 10   [8 days]   |  |
| |  [ ] Final walkthrough             Due: Feb 14   [12 days]  |  |
| |  [*] Closing date                  Due: Feb 15   [13 days]  |  |
| +-------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

### Cascade Update Logic

When a key date changes (e.g., closing date moves):

```
+-------------------+
| CLOSING DATE      |
| CHANGED           |
| Feb 15 -> Feb 22  |
+---------+---------+
          |
          v
+---------+---------+
| IDENTIFY DEPENDENT|
| DEADLINES         |
| - Closing disc: -3 BD
| - Walkthrough: -1 day
| - Wire date: -1 day
+---------+---------+
          |
          v
+---------+---------+
| PREVIEW CHANGES   |
| MODAL             |
+---------+---------+
| The following     |
| dates will update:|
|                   |
| Closing disc:     |
| Feb 12 -> Feb 19  |
|                   |
| Walkthrough:      |
| Feb 14 -> Feb 21  |
|                   |
| [Cancel] [Apply]  |
+---------+---------+
          |
          v
+---------+---------+
| UPDATE & NOTIFY   |
| - Calendar sync   |
| - Team alerts     |
| - Client notify   |
+-------------------+
```

---

## 5. Search and Filter Patterns

### Global Search Flow

```
+-------------------+
|  SEARCH TRIGGER   |
| Cmd+K / Click bar |
+---------+---------+
          |
          v
+---------+---------+
|  SEARCH MODAL     |
| (Command Palette) |
+---------+---------+
          |
          | User types query
          v
+---------+---------+     +-----------------+
|  INSTANT RESULTS  |<----+ DEBOUNCED QUERY |
|  (As you type)    |     | 200ms delay     |
+---------+---------+     +-----------------+
          |
          v
+---------+---------+
|  RESULT CATEGORIES|
| [Matters: 5]      |
| [Documents: 12]   |
| [Clients: 3]      |
| [Actions: 2]      |
+---------+---------+
          |
          | User selects result
          v
+---------+---------+
|  NAVIGATION       |
| - Matter: Detail  |
| - Doc: Viewer     |
| - Client: Profile |
| - Action: Execute |
+-------------------+
```

### Search Modal Interface

```
+--------------------------------------------------+
|  [Search Icon]  Search IRONCLAD...        [Esc]  |
+--------------------------------------------------+
|                                                  |
|  RECENT                                          |
|  [Clock] Smith Residence Purchase                |
|  [Clock] Title_Commitment.pdf                    |
|  [Clock] Johnson, Robert                         |
|                                                  |
|  QUICK ACTIONS                                   |
|  [+] New Matter                          Cmd+N   |
|  [+] Upload Document                     Cmd+U   |
|  [?] Help & Documentation                Cmd+?   |
|                                                  |
+--------------------------------------------------+

AFTER TYPING "smith":
+--------------------------------------------------+
|  [Search Icon]  smith                     [Esc]  |
+--------------------------------------------------+
|                                                  |
|  MATTERS (3)                                     |
|  [Briefcase] Smith Residence Purchase            |
|              123 Main St | Active | Feb 15       |
|  [Briefcase] Smith Commercial Lease              |
|              456 Oak Ave | Closed | Jan 10       |
|  [Briefcase] Smithson Refinance                  |
|              789 Pine Rd | Pending | Mar 1       |
|                                                  |
|  DOCUMENTS (5)                                   |
|  [PDF] Smith_Purchase_Agreement.pdf              |
|  [PDF] Smith_Title_Commitment.pdf                |
|  ... View all 5 documents                        |
|                                                  |
|  CLIENTS (2)                                     |
|  [Avatar] John Smith                             |
|  [Avatar] Jane Smith                             |
|                                                  |
|  [Enter to select] [Tab to navigate]             |
+--------------------------------------------------+
```

### Filter Patterns

```
FILTER BAR PATTERN:
+------------------------------------------------------------------+
| [Type: All v] [Status: Active v] [Assigned: Me v] [Date: Any v]  |
| [X Clear All]                                                     |
+------------------------------------------------------------------+

ADVANCED FILTER PANEL:
+---------------------------+
| FILTERS                   |
+---------------------------+
|                           |
| Document Type             |
| [x] Contract              |
| [x] Title                 |
| [ ] Correspondence        |
| [ ] Closing docs          |
|                           |
| Date Range                |
| [Jan 1, 2026] - [Today]   |
|                           |
| Status                    |
| (*) All                   |
| ( ) Draft                 |
| ( ) Final                 |
| ( ) Signed                |
|                           |
| [Apply Filters]           |
| [Reset]                   |
+---------------------------+
```

### Filter Persistence

- Filters persist within session
- Optional: Save filter presets
- URL reflects filter state for shareability

---

## 6. Document Generation Flow

### Overview
Creating documents from templates with smart field population.

### Flow Diagram

```
+-------------------+
|      START        |
| (Matter Detail    |
|  or Quick Action) |
+---------+---------+
          |
          v
+---------+---------+
| SELECT TEMPLATE   |
| - By category     |
| - By recent       |
| - Search          |
+---------+---------+
          |
          v
+---------+---------+
| TEMPLATE SELECTED |
| e.g., "General    |
| Warranty Deed"    |
+---------+---------+
          |
          v
+---------+---------+     +------------------+
| AUTO-POPULATE     |<----+ MATTER DATA      |
| FIELDS            |     | - Parties        |
|                   |     | - Property       |
| [=====>    ] 60%  |     | - Transaction    |
+---------+---------+     +------------------+
          |
          v
+---------+---------+
| FIELD REVIEW      |
| - Pre-filled      |
| - Missing (red)   |
| - Calculated      |
+---------+---------+
          |
          v
+---------+---------+
| USER COMPLETES    |
| MISSING FIELDS    |
| [Legal description]
| [Consideration]   |
| [Special clauses] |
+---------+---------+
          |
          v
+---------+---------+
| JURISDICTION      |
| CHECK             |
| - State rules     |
| - Notary language |
| - Witness reqs    |
+---------+---------+
          |
          v
+---------+---------+
| PREVIEW DOCUMENT  |
| (PDF render)      |
+---------+---------+
          |
    +-----+-----+
    |           |
    v           v
+---+----+  +---+-------+
|EDIT    |  |GENERATE   |
|MORE    |  |FINAL      |
+---+----+  +---+-------+
    |           |
    |           v
    |   +-------+-------+
    |   | SAVE OPTIONS  |
    |   | - Draft       |
    |   | - Final       |
    |   | - Send for sig|
    |   +-------+-------+
    |           |
    +<----------+
          |
          v
+---------+---------+
| DOCUMENT SAVED    |
| TO MATTER         |
+-------------------+
```

### Template Selection Interface

```
+------------------------------------------------------------------+
| Generate Document                                         [X]    |
+------------------------------------------------------------------+
| Search templates: [                                ]              |
+------------------------------------------------------------------+
|                                                                   |
| RECENTLY USED                                                     |
| +--------------------+  +--------------------+                    |
| | [Doc] General      |  | [Doc] Settlement   |                   |
| |      Warranty Deed |  |      Statement     |                   |
| +--------------------+  +--------------------+                    |
|                                                                   |
| CONVEYANCING                                                      |
| +--------------------+  +--------------------+  +---------------+ |
| | [Doc] General      |  | [Doc] Special      |  | [Doc] Quit-  | |
| |      Warranty Deed |  |      Warranty Deed |  |      claim   | |
| +--------------------+  +--------------------+  +---------------+ |
|                                                                   |
| CLOSING DOCUMENTS                                                 |
| +--------------------+  +--------------------+  +---------------+ |
| | [Doc] Settlement   |  | [Doc] Closing      |  | [Doc] FIRPTA | |
| |      Statement     |  |      Disclosure    |  |      Affidavit| |
| +--------------------+  +--------------------+  +---------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Field Population Interface

```
+------------------------------------------------------------------+
| General Warranty Deed - Field Review                      [X]    |
+------------------------------------------------------------------+
|                                                                   |
| GRANTOR INFORMATION                          Status: [Complete]  |
| +-------------------------------------------------------------+  |
| | Name:    Robert Johnson                    [Auto-filled]    |  |
| | Address: 456 Seller St, City, ST 12345     [Auto-filled]    |  |
| +-------------------------------------------------------------+  |
|                                                                   |
| GRANTEE INFORMATION                          Status: [Complete]  |
| +-------------------------------------------------------------+  |
| | Name:    John Smith and Jane Smith         [Auto-filled]    |  |
| | Address: 789 Buyer Ave, City, ST 12345     [Auto-filled]    |  |
| +-------------------------------------------------------------+  |
|                                                                   |
| PROPERTY INFORMATION                         Status: [Incomplete]|
| +-------------------------------------------------------------+  |
| | Address: 123 Main Street, Springfield, IL  [Auto-filled]    |  |
| | Legal Description:                                          |  |
| | [                                                        ]  |  |
| | [  REQUIRED - Enter or paste legal description          ]  |  |
| | [                                                        ]  |  |
| +-------------------------------------------------------------+  |
|                                                                   |
| CONSIDERATION                                Status: [Complete]  |
| +-------------------------------------------------------------+  |
| | Amount: $425,000.00                        [Auto-filled]    |  |
| +-------------------------------------------------------------+  |
|                                                                   |
|                                [Preview]  [Save Draft]  [Generate]|
+------------------------------------------------------------------+
```

---

## 7. AI Analysis Flow

### Overview
AI-powered document analysis with human-in-loop verification.

### Flow Diagram

```
+-------------------+
|  DOCUMENT         |
|  UPLOADED         |
+---------+---------+
          |
          v
+---------+---------+
|  AI ANALYSIS      |
|  TRIGGERED        |
| (Background job)  |
+---------+---------+
          |
          v
+---------+---------+
|  PROCESSING HUD   |
| - Text extraction |
| - Entity detection|
| - Risk analysis   |
| - Summary gen     |
+---------+---------+
          |
          v
+---------+---------+
|  CONFIDENCE       |
|  CALCULATED       |
+---------+---------+
     |    |    |
     v    v    v
+----+ +--+--+ +----+
|HIGH| |MED  | |LOW |
|90%+| |70-89| |<70%|
+--+-+ +--+--+ +--+-+
   |      |       |
   v      v       v
+--+--+ +-+---+ +-+----+
|AUTO | |FLAG | |REQUIRE
|ACCEPT| |WARN| |REVIEW|
+--+--+ +-+---+ +-+----+
   |      |       |
   +------+-------+
          |
          v
+---------+---------+
|  RESULTS DISPLAY  |
| - Key findings    |
| - Extracted data  |
| - Risk flags      |
| - Confidence      |
+---------+---------+
          |
          v
+---------+---------+     +------------------+
|  USER ACTIONS     |     |                  |
| - Accept findings |---->+ UPDATE MATTER    |
| - Edit values     |     | - Add dates      |
| - Reject analysis |     | - Link parties   |
| - Request re-run  |     | - Create tasks   |
+---------+---------+     +------------------+
          |
          v
+---------+---------+
|  FEEDBACK LOOP    |
| (Improves future  |
|  accuracy)        |
+-------------------+
```

### AI Results Interface

```
+------------------------------------------------------------------+
| AI Analysis: Purchase_Agreement.pdf                       [X]    |
+------------------------------------------------------------------+
| Confidence: HIGH (94%)                              [?] How this |
| [=================================] 94%                 works    |
+------------------------------------------------------------------+
|                                                                   |
| [i] This analysis was generated by AI. Results should be         |
|     reviewed before use in legal documents.                      |
|                                                                   |
+------------------------------------------------------------------+
| EXTRACTED INFORMATION                                             |
+------------------------------------------------------------------+
|                                                                   |
| Purchase Price         $425,000.00                    [Accept]   |
| Earnest Money          $10,000.00                     [Accept]   |
| Closing Date           February 15, 2026              [Accept]   |
| Property Address       123 Main St, Springfield, IL   [Accept]   |
|                                                                   |
| CONTINGENCIES DETECTED                                            |
| [x] Financing - 30 days from contract                [Accept]   |
| [x] Inspection - 10 days from contract               [Accept]   |
| [ ] Appraisal - Not detected                         [Add]      |
|                                                                   |
+------------------------------------------------------------------+
| RISK FLAGS                                                        |
+------------------------------------------------------------------+
|                                                                   |
| [!] MEDIUM: Unusual inspection remedy clause (Section 8.2)       |
|     "Seller may elect to terminate rather than repair..."        |
|     Recommendation: Review with client                           |
|                                                     [View in Doc]|
|                                                                   |
| [!] LOW: Non-standard earnest money holder                       |
|     Escrow held by listing brokerage, not title company          |
|                                                     [View in Doc]|
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| [Reject All]     [Accept All]     [Accept Selected & Close]      |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 8. Client Portal Onboarding Flow

### Overview
First-time client access and portal familiarization.

### Flow Diagram

```
+-------------------+
|  CLIENT RECEIVES  |
|  INVITE EMAIL     |
+---------+---------+
          |
          | Click "Access Portal"
          v
+---------+---------+
|  REGISTRATION     |
| - Verify email    |
| - Set password    |
| - Accept terms    |
+---------+---------+
          |
          v
+---------+---------+
|  MFA SETUP        |
| - Phone number    |
| - Authenticator   |
| - Backup codes    |
+---------+---------+
          |
          v
+---------+---------+
|  WELCOME TOUR     |
| (Optional)        |
+---------+---------+
          |
    +-----+-----+
    |           |
    v           v
+---+----+  +---+-------+
|TAKE    |  |SKIP       |
|TOUR    |  |           |
+---+----+  +---+-------+
    |           |
    v           |
+---+--------+  |
| GUIDED     |  |
| WALKTHROUGH|  |
| - Dashboard|  |
| - Documents|  |
| - Messages |  |
| - Actions  |  |
+---+--------+  |
    |           |
    +-----+-----+
          |
          v
+---------+---------+
|  PORTAL DASHBOARD |
| (First view)      |
+---------+---------+
          |
          v
+---------+---------+
|  PENDING ACTIONS  |
|  HIGHLIGHTED      |
| - Upload docs     |
| - Sign documents  |
| - Review items    |
+-------------------+
```

### Welcome Tour Screens

```
TOUR STEP 1 - DASHBOARD:
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  |  [Spotlight on Progress Bar]               |  |
|  |                                            |  |
|  |  "Track Your Transaction"                  |  |
|  |                                            |  |
|  |  This progress bar shows exactly where     |  |
|  |  your transaction stands. Each milestone   |  |
|  |  represents a key step toward closing.     |  |
|  |                                            |  |
|  |            [1 of 4]      [Next ->]         |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+

TOUR STEP 2 - ACTION ITEMS:
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  |  [Spotlight on Action Items]               |  |
|  |                                            |  |
|  |  "Never Miss a Deadline"                   |  |
|  |                                            |  |
|  |  Action items show what you need to        |  |
|  |  provide. Red items are urgent. Complete   |  |
|  |  them to keep your closing on track.       |  |
|  |                                            |  |
|  |  [<- Back]    [2 of 4]      [Next ->]      |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

### Client Registration Form

```
+--------------------------------------------------+
|                    [Firm Logo]                   |
|                                                  |
|          Welcome to Your Client Portal           |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  You've been invited by Smith & Associates       |
|  to access your transaction portal.              |
|                                                  |
|  Email                                           |
|  +--------------------------------------------+  |
|  | john.smith@email.com                   [*] |  |
|  +--------------------------------------------+  |
|  (Pre-filled, verified)                          |
|                                                  |
|  Create Password                                 |
|  +--------------------------------------------+  |
|  | ********                                   |  |
|  +--------------------------------------------+  |
|  Must be 12+ characters with upper, lower,       |
|  number, and special character                   |
|                                                  |
|  Confirm Password                                |
|  +--------------------------------------------+  |
|  | ********                                   |  |
|  +--------------------------------------------+  |
|                                                  |
|  [x] I agree to the Terms of Service and        |
|      Privacy Policy                              |
|                                                  |
|           [Create Account]                       |
|                                                  |
+--------------------------------------------------+
```

---

## Flow Implementation Checklist

For each user flow, verify:

- [ ] All paths documented (success, error, edge cases)
- [ ] Loading states defined for async operations
- [ ] Error handling and recovery paths
- [ ] Accessibility during all states
- [ ] Mobile adaptations considered
- [ ] Analytics events identified
- [ ] Permission checks at decision points
- [ ] Offline handling (if applicable)
- [ ] Session timeout handling
- [ ] Back button / navigation behavior

---

*End of User Flows Specification*
