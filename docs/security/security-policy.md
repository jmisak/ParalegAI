# IRONCLAD Security Policy

**Version:** 1.0.0
**Last Updated:** 2026-02-02
**Classification:** INTERNAL

## 1. Executive Summary

This document defines the security requirements and controls for the IRONCLAD AI-Powered Paralegal Assistant. IRONCLAD handles attorney-client privileged information and must comply with applicable bar association ethics rules, data protection regulations, and industry security standards.

## 2. Scope

This policy applies to:
- All IRONCLAD application components (frontend, backend, databases)
- All users (attorneys, paralegals, staff, administrators)
- All data processed by the system
- All third-party integrations

## 3. Security Principles

### 3.1 Defense in Depth
Multiple layers of security controls are implemented at every tier of the application stack.

### 3.2 Least Privilege
All users and system components operate with minimum necessary permissions.

### 3.3 Zero Trust
No implicit trust is granted based on network location or prior authentication.

### 3.4 Secure by Default
All features are deployed with the most restrictive security settings.

## 4. Authentication Requirements

### 4.1 Password Policy
| Requirement | Value |
|-------------|-------|
| Minimum Length | 12 characters |
| Maximum Length | 128 characters |
| Character Classes | 3 of 4 (upper, lower, number, special) |
| Breach Checking | Required (HIBP API) |
| History | 10 previous passwords |
| Expiration | None (NIST 800-63B compliant) |
| Lockout Threshold | 5 failed attempts |
| Lockout Duration | 30 minutes |

### 4.2 Multi-Factor Authentication (MFA)
- **Requirement:** Mandatory for all users
- **Methods:** TOTP (Google Authenticator, Authy, etc.)
- **Backup Codes:** 10 single-use codes
- **Recovery Key:** 32-character high-entropy key

### 4.3 Session Management
| Parameter | Value |
|-----------|-------|
| Idle Timeout | 15 minutes |
| Absolute Timeout | 8 hours |
| Concurrent Sessions | 5 maximum |
| Session Binding | IP + User-Agent |
| Regeneration | On privilege change |

## 5. Authorization Controls

### 5.1 Access Control Model
IRONCLAD implements Attribute-Based Access Control (ABAC) with the following attributes:
- User role
- Organization membership
- Matter assignment
- Privilege classification
- Chinese wall restrictions

### 5.2 Role Hierarchy
| Role | Description | Privilege Level |
|------|-------------|-----------------|
| Admin | System administrator | 100 |
| Partner | Senior attorney | 90 |
| Attorney | Licensed attorney | 80 |
| Paralegal | Legal support staff | 60 |
| Staff | Administrative staff | 40 |
| Client | External client user | 20 |
| Guest | Limited access | 10 |

### 5.3 Conflict of Interest Controls
- Automated conflict checking on matter access
- Chinese wall enforcement between conflicting matters
- Waiver tracking and verification
- Real-time conflict screening

## 6. Data Protection

### 6.1 Data Classification
| Classification | Description | Encryption | Retention |
|----------------|-------------|------------|-----------|
| PUBLIC | Publicly available | Optional | Indefinite |
| INTERNAL | Organizational use | In transit | 7 years |
| CONFIDENTIAL | Client confidential | At rest + transit | Matter + 7 years |
| PRIVILEGED | Attorney-client | At rest + transit | Matter + 10 years |
| WORK_PRODUCT | Attorney mental impressions | At rest + transit | Matter + 10 years |

### 6.2 Encryption Standards
- **In Transit:** TLS 1.3 (minimum TLS 1.2)
- **At Rest:** AES-256-GCM
- **Key Management:** AWS KMS or HashiCorp Vault
- **PII Fields:** Field-level encryption (SSN, DOB, EIN)

### 6.3 Data Handling Rules
1. No client data used for AI model training
2. Soft deletes only (no hard deletes)
3. All records retain audit trail
4. Documents are immutable (version-based updates)

## 7. API Security

### 7.1 Rate Limiting
| Endpoint Category | Requests | Window | Block Duration |
|-------------------|----------|--------|----------------|
| Global (per IP) | 100 | 1 minute | 5 minutes |
| Authentication | 5 | 15 minutes | 1 hour |
| Password Reset | 3 | 1 hour | 2 hours |
| MFA Verification | 5 | 5 minutes | 30 minutes |
| API (authenticated) | 60 | 1 minute | 1 minute |
| AI Operations | 10 | 1 minute | 2 minutes |
| Export Operations | 5 | 1 hour | 1 hour |

### 7.2 Input Validation
- All input sanitized for injection attacks
- Maximum request body size: 10MB
- Maximum string length: 64KB
- Maximum array length: 1000 elements
- Maximum object depth: 10 levels

### 7.3 HTTP Security Headers
- Content-Security-Policy: Strict (no inline scripts)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Referrer-Policy: strict-origin-when-cross-origin

## 8. Logging and Monitoring

### 8.1 Audit Log Requirements
All security-relevant events must be logged with:
- Timestamp (ISO 8601, UTC)
- Event ID (unique)
- User ID and session ID
- Action performed
- Resource accessed
- Outcome (success/failure)
- IP address and User-Agent
- Tamper-evident hash chain

### 8.2 Events to Log
- Authentication attempts (success/failure)
- Authorization decisions
- Privileged data access
- Data exports
- Configuration changes
- Administrative actions
- Security exceptions

### 8.3 Log Retention
| Log Type | Retention Period |
|----------|-----------------|
| Security Logs | 7 years |
| Access Logs | 1 year |
| Application Logs | 90 days |
| Debug Logs | 7 days |

## 9. AI-Specific Security

### 9.1 Prompt Injection Defense
- Input sanitization for all AI-processed text
- Output validation before display
- No system prompts exposed to users
- Rate limiting on AI endpoints

### 9.2 AI Data Isolation
- Client data processed in isolated contexts
- No cross-client data leakage
- Model responses filtered for PII
- No training on client data

## 10. Compliance Requirements

### 10.1 Regulatory Frameworks
- ABA Model Rules of Professional Conduct
- State bar ethics rules (jurisdiction-specific)
- GDPR (where applicable)
- CCPA (where applicable)
- SOC 2 Type II (target)

### 10.2 Security Assessments
| Assessment Type | Frequency |
|-----------------|-----------|
| Vulnerability Scan | Weekly |
| Penetration Test | Annually |
| Code Review | Per release |
| Access Review | Quarterly |
| Risk Assessment | Annually |

## 11. Incident Response

See [Incident Response Plan](./incident-response.md) for detailed procedures.

## 12. Exceptions

Security policy exceptions require:
1. Written business justification
2. Risk assessment
3. Compensating controls documentation
4. Approval from Security Officer
5. Time-limited validity (maximum 90 days)

## 13. Policy Enforcement

Violations of this security policy may result in:
- Access revocation
- Disciplinary action
- Termination of employment
- Legal action (if warranted)

## 14. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-02 | @Ralph | Initial release |

---

**Approved By:** [Security Officer]
**Review Date:** 2026-08-02
