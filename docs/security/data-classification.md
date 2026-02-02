# IRONCLAD Data Classification Guide

**Version:** 1.0.0
**Last Updated:** 2026-02-02
**Classification:** INTERNAL

## 1. Purpose

This document defines the data classification levels, handling requirements, and access controls for all data processed by IRONCLAD.

## 2. Classification Levels

### 2.1 PUBLIC

**Definition:** Information intended for public disclosure with no confidentiality requirements.

**Examples:**
- Marketing materials
- Published case law
- Public court filings
- General legal information

**Handling Requirements:**
| Control | Requirement |
|---------|-------------|
| Encryption (Transit) | Optional |
| Encryption (Rest) | Not required |
| Access Control | None |
| Sharing | Unrestricted |
| Disposal | Standard deletion |

### 2.2 INTERNAL

**Definition:** Organizational information not intended for external distribution but not confidential.

**Examples:**
- Internal procedures
- Training materials
- Non-sensitive business data
- Staff directories

**Handling Requirements:**
| Control | Requirement |
|---------|-------------|
| Encryption (Transit) | Required (TLS 1.2+) |
| Encryption (Rest) | Recommended |
| Access Control | Organization-based |
| Sharing | Internal only |
| Disposal | Secure deletion |
| Retention | 7 years |

### 2.3 CONFIDENTIAL

**Definition:** Client information that is confidential but not subject to attorney-client privilege.

**Examples:**
- Client contact information
- Property addresses
- Transaction details
- Financial information
- Business records

**Handling Requirements:**
| Control | Requirement |
|---------|-------------|
| Encryption (Transit) | Required (TLS 1.3) |
| Encryption (Rest) | Required (AES-256) |
| Access Control | Matter-based + Role-based |
| Sharing | Client consent required |
| Disposal | Secure deletion + certificate |
| Retention | Matter close + 7 years |
| Logging | All access logged |

**PII Subclass:**
Personally Identifiable Information requires additional field-level encryption:
- Social Security Numbers (SSN)
- Dates of Birth (DOB)
- Employer Identification Numbers (EIN)
- Bank account numbers
- Credit card numbers

### 2.4 PRIVILEGED

**Definition:** Information protected by attorney-client privilege (confidential communications between attorney and client for legal advice).

**Examples:**
- Legal advice memoranda
- Client communications regarding legal matters
- Attorney notes on legal strategy
- Privileged email correspondence

**Handling Requirements:**
| Control | Requirement |
|---------|-------------|
| Encryption (Transit) | Required (TLS 1.3 + mTLS) |
| Encryption (Rest) | Required (AES-256-GCM) |
| Access Control | Attorney + authorized staff only |
| Sharing | Never without client consent |
| Disposal | Secure deletion + certificate + audit |
| Retention | Matter close + 10 years |
| Logging | All access logged + audited |
| Marking | "PRIVILEGED AND CONFIDENTIAL" |

**Privilege Protection Requirements:**
1. Access limited to attorneys and authorized support staff
2. All access logged with tamper-evident audit trail
3. No forwarding to unauthorized parties
4. Privilege waiver tracking
5. Chinese wall enforcement

### 2.5 WORK_PRODUCT

**Definition:** Attorney work product doctrine materials (documents prepared in anticipation of litigation reflecting attorney's mental impressions, conclusions, or legal theories).

**Examples:**
- Litigation strategy documents
- Case analysis memoranda
- Attorney mental impressions
- Legal research with annotations
- Interview notes with legal analysis

**Handling Requirements:**
| Control | Requirement |
|---------|-------------|
| Encryption (Transit) | Required (TLS 1.3 + mTLS) |
| Encryption (Rest) | Required (AES-256-GCM) |
| Access Control | Authoring attorney + designated reviewers |
| Sharing | Attorney approval required |
| Disposal | Secure deletion + certificate + audit |
| Retention | Matter close + 10 years |
| Logging | All access logged + audited |
| Marking | "ATTORNEY WORK PRODUCT" |

**Additional Protections:**
- Stricter access than PRIVILEGED (author-limited)
- Special handling for "opinion" work product
- Litigation hold awareness

### 2.6 JOINT_DEFENSE

**Definition:** Information shared under a joint defense or common interest agreement.

**Examples:**
- Joint defense communications
- Shared legal strategies
- Common interest materials
- Multi-party privilege communications

**Handling Requirements:**
| Control | Requirement |
|---------|-------------|
| Encryption (Transit) | Required (TLS 1.3 + mTLS) |
| Encryption (Rest) | Required (AES-256-GCM) |
| Access Control | Joint defense group members only |
| Sharing | Within joint defense group only |
| Disposal | Per joint defense agreement |
| Retention | Per joint defense agreement |
| Logging | All access logged + audited |
| Marking | "JOINT DEFENSE PRIVILEGED" |

**Special Requirements:**
- Joint defense agreement must be on file
- Group membership tracking
- Withdrawal procedures

## 3. Access Control Matrix

### 3.1 Role-Based Access

| Role | PUBLIC | INTERNAL | CONFIDENTIAL | PRIVILEGED | WORK_PRODUCT | JOINT_DEFENSE |
|------|--------|----------|--------------|------------|--------------|---------------|
| Admin | Read | Read | Manage* | No | No | No |
| Partner | Read | Read/Write | Read/Write | Read/Write | Read/Write | If member |
| Attorney | Read | Read/Write | Read/Write | Read/Write | Author only | If member |
| Paralegal | Read | Read | Read** | Read** | No | No |
| Staff | Read | Read | Read** | No | No | No |
| Client | Read | No | Own data | Own matters | No | If party |

*Admin access to CONFIDENTIAL is for system management only, not content access
**Requires matter assignment

### 3.2 Additional Access Conditions

| Condition | Description |
|-----------|-------------|
| Matter Assignment | User must be assigned to the matter |
| Chinese Wall Clear | No conflict of interest exists |
| MFA Verified | Multi-factor authentication completed |
| Privilege Review | For PRIVILEGED data, privilege has been asserted |

## 4. Data Handling Procedures

### 4.1 Labeling Requirements

All non-PUBLIC documents must display classification label:
- Header or footer of documents
- Email subject line prefix
- File metadata
- System display

**Label Formats:**
```
[PUBLIC]
[INTERNAL - ORGANIZATION USE ONLY]
[CONFIDENTIAL - CLIENT INFORMATION]
[PRIVILEGED AND CONFIDENTIAL - ATTORNEY-CLIENT COMMUNICATION]
[ATTORNEY WORK PRODUCT - DO NOT DISTRIBUTE]
[JOINT DEFENSE PRIVILEGED - AUTHORIZED PARTIES ONLY]
```

### 4.2 Transmission Requirements

| Classification | Email | File Transfer | Fax | Physical |
|----------------|-------|---------------|-----|----------|
| PUBLIC | Standard | Any | OK | Standard |
| INTERNAL | TLS | SFTP/TLS | OK | Sealed |
| CONFIDENTIAL | Encrypted | SFTP only | Encrypted | Tracked |
| PRIVILEGED | Encrypted + Password | SFTP only | No | Tracked + Signature |
| WORK_PRODUCT | Encrypted + Password | SFTP only | No | Tracked + Signature |
| JOINT_DEFENSE | Encrypted + Password | SFTP only | No | Tracked + Signature |

### 4.3 Storage Requirements

| Classification | Cloud Storage | Local Storage | Portable Media |
|----------------|---------------|---------------|----------------|
| PUBLIC | Any | Any | Any |
| INTERNAL | Approved cloud | Org devices | Encrypted |
| CONFIDENTIAL | Approved cloud (encrypted) | Encrypted devices | Encrypted + approved |
| PRIVILEGED | Approved cloud (encrypted) | Encrypted devices | Not recommended |
| WORK_PRODUCT | Approved cloud (encrypted) | Encrypted devices | Not recommended |
| JOINT_DEFENSE | Approved cloud (encrypted) | Encrypted devices | Prohibited |

### 4.4 Disposal Requirements

| Classification | Method | Verification |
|----------------|--------|--------------|
| PUBLIC | Standard deletion | None |
| INTERNAL | Secure deletion | Log entry |
| CONFIDENTIAL | Secure deletion (NIST 800-88) | Certificate |
| PRIVILEGED | Secure deletion (NIST 800-88) | Certificate + audit |
| WORK_PRODUCT | Secure deletion (NIST 800-88) | Certificate + audit |
| JOINT_DEFENSE | Per agreement + secure deletion | Certificate + audit |

## 5. Classification Decision Tree

```
Is the data intended for public disclosure?
├── YES → PUBLIC
└── NO
    └── Does it contain client information?
        ├── NO → INTERNAL
        └── YES
            └── Is it an attorney-client communication for legal advice?
                ├── YES
                │   └── Is it shared under joint defense agreement?
                │       ├── YES → JOINT_DEFENSE
                │       └── NO → PRIVILEGED
                └── NO
                    └── Was it prepared in anticipation of litigation?
                        ├── YES
                        │   └── Does it contain attorney mental impressions?
                        │       ├── YES → WORK_PRODUCT
                        │       └── NO → CONFIDENTIAL
                        └── NO → CONFIDENTIAL
```

## 6. Reclassification

### 6.1 Upgrading Classification
- Any user can flag data for higher classification
- Security team reviews and confirms
- Immediate effect upon upgrade

### 6.2 Downgrading Classification
- Requires approval from:
  - PRIVILEGED/WORK_PRODUCT: Attorney of record
  - CONFIDENTIAL: Matter supervising attorney
  - INTERNAL: Department head
- Documented with justification
- Waiver implications assessed for privileged data

## 7. Compliance Mapping

| Requirement | PUBLIC | INTERNAL | CONFIDENTIAL | PRIVILEGED | WORK_PRODUCT | JOINT_DEFENSE |
|-------------|--------|----------|--------------|------------|--------------|---------------|
| ABA Rule 1.6 | N/A | N/A | Required | Required | Required | Required |
| GDPR (if PII) | Yes | Yes | Yes | Yes | Yes | Yes |
| CCPA (if PI) | Yes | Yes | Yes | Yes | Yes | Yes |
| SOC 2 | Yes | Yes | Yes | Yes | Yes | Yes |

## 8. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-02 | @Ralph | Initial release |

---

**Approved By:** [Security Officer]
**Next Review:** 2026-08-02
