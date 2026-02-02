# IRONCLAD Encryption Specification

**Version:** 1.0.0
**Last Updated:** 2026-02-02
**Classification:** INTERNAL

## 1. Purpose

This document specifies the cryptographic standards, algorithms, and key management procedures for IRONCLAD.

## 2. Cryptographic Standards

### 2.1 Approved Algorithms

| Purpose | Algorithm | Key Size | Notes |
|---------|-----------|----------|-------|
| Symmetric Encryption | AES-256-GCM | 256-bit | Primary encryption |
| Symmetric Encryption (Legacy) | AES-256-CBC | 256-bit | Legacy compatibility only |
| Asymmetric Encryption | RSA-OAEP | 4096-bit | Key exchange |
| Asymmetric Encryption | ECDH | P-384 | Modern key exchange |
| Digital Signatures | RSA-PSS | 4096-bit | Document signing |
| Digital Signatures | ECDSA | P-384 | Modern signing |
| Password Hashing | Argon2id | N/A | Primary password hash |
| Password Hashing (Legacy) | bcrypt | 12 rounds | Legacy compatibility |
| Message Authentication | HMAC-SHA-256 | 256-bit | Integrity verification |
| Message Authentication | HMAC-SHA-512 | 512-bit | High security contexts |
| Key Derivation | HKDF-SHA-256 | 256-bit | Key derivation |
| Key Derivation | PBKDF2-SHA-256 | 256-bit | Password-based |
| Random Generation | CSPRNG | 256-bit | Cryptographic operations |

### 2.2 Prohibited Algorithms

| Algorithm | Reason | Migration Path |
|-----------|--------|----------------|
| MD5 | Broken | SHA-256 |
| SHA-1 | Weak | SHA-256 |
| DES | Broken | AES-256 |
| 3DES | Deprecated | AES-256 |
| RC4 | Broken | AES-256-GCM |
| RSA-1024 | Weak | RSA-4096 |
| RSA-PKCS1v15 | Vulnerable | RSA-OAEP |
| ECB mode | Insecure | GCM mode |

## 3. Encryption at Rest

### 3.1 Database Encryption

**Primary Database (PostgreSQL):**
```
Encryption: Transparent Data Encryption (TDE)
Algorithm: AES-256
Key Management: AWS KMS / HashiCorp Vault
Key Rotation: 90 days
```

**Field-Level Encryption (PII):**
```yaml
Encrypted Fields:
  - users.ssn
  - users.date_of_birth
  - users.ein
  - clients.tax_id
  - clients.bank_account
  - documents.privileged_content (if stored)

Algorithm: AES-256-GCM
Key Derivation: Per-organization key + field-specific context
IV: Unique per encryption operation (96-bit)
AAD: Field name + record ID
```

### 3.2 File Storage Encryption

**S3/Object Storage:**
```
Server-Side Encryption: SSE-KMS
Algorithm: AES-256
Key Management: AWS KMS
Bucket Policy: Deny unencrypted uploads
```

**Local/Attached Storage:**
```
Full Disk Encryption: LUKS (Linux) / BitLocker (Windows)
Algorithm: AES-256-XTS
Key Storage: TPM-bound where available
```

### 3.3 Backup Encryption

```yaml
Backup Encryption:
  Algorithm: AES-256-GCM
  Key: Separate backup encryption key
  Key Storage: Offline/HSM
  Key Rotation: Annually
  Verification: Restore test quarterly
```

## 4. Encryption in Transit

### 4.1 TLS Configuration

**Minimum Version:** TLS 1.2
**Preferred Version:** TLS 1.3

**TLS 1.3 Cipher Suites (Preferred):**
```
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
```

**TLS 1.2 Cipher Suites (When 1.3 unavailable):**
```
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-CHACHA20-POLY1305
ECDHE-RSA-CHACHA20-POLY1305
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
```

**Disabled Features:**
- TLS compression (CRIME attack)
- Session tickets without rotation
- Renegotiation (except secure)

### 4.2 Certificate Requirements

| Attribute | Requirement |
|-----------|-------------|
| Key Type | ECDSA P-384 or RSA 4096 |
| Signature | SHA-384 or SHA-256 |
| Validity | Maximum 1 year |
| CA | Publicly trusted or internal PKI |
| OCSP | Stapling required |
| CT | Certificate Transparency required |

### 4.3 mTLS (Mutual TLS)

**Required For:**
- Service-to-service communication
- API gateway to backend services
- Database connections (production)

**Configuration:**
```yaml
Client Certificate:
  Issuer: Internal CA
  Validity: 90 days
  Subject: Service identity
  Key Usage: Digital Signature, Key Encipherment
  Extended Key Usage: Client Authentication
```

## 5. Key Management

### 5.1 Key Hierarchy

```
Root Key (HSM-protected)
├── Master Encryption Key (KEK)
│   ├── Database Encryption Key (DEK)
│   ├── File Encryption Key (DEK)
│   └── Field Encryption Key (DEK)
├── Signing Key
│   ├── Document Signing Key
│   └── JWT Signing Key
└── Organization Keys
    ├── Org-specific DEK
    └── Org-specific field keys
```

### 5.2 Key Storage

| Key Type | Storage Location | Access Control |
|----------|------------------|----------------|
| Root Key | HSM | Physical + multi-party |
| Master KEK | HSM or KMS | IAM + MFA |
| DEKs | KMS (encrypted) | Service accounts |
| JWT Secrets | Secrets Manager | Application only |
| API Keys | Secrets Manager | Application only |

### 5.3 Key Rotation

| Key Type | Rotation Frequency | Method |
|----------|-------------------|--------|
| Root Key | 2 years | Manual ceremony |
| Master KEK | 1 year | Automated |
| Database DEK | 90 days | Automated |
| Field DEKs | 90 days | Automated |
| JWT Signing | 30 days | Automated |
| TLS Certificates | 90 days | Automated |
| API Keys | On compromise | Manual |

### 5.4 Key Rotation Procedure

**Automated Rotation (DEKs):**
1. Generate new key version
2. Update key reference in KMS
3. New encryptions use new key
4. Decryptions support both versions
5. Re-encrypt data on access (lazy rotation)
6. Archive old key version

**Manual Rotation (Critical Keys):**
1. Schedule rotation window
2. Generate new key (multi-party)
3. Update dependent systems
4. Verify new key functionality
5. Revoke old key after grace period
6. Document rotation event

## 6. Password Security

### 6.1 Argon2id Parameters

```yaml
Argon2id Configuration:
  type: argon2id
  memory_cost: 65536  # 64 MiB
  time_cost: 3        # 3 iterations
  parallelism: 4      # 4 threads
  hash_length: 32     # 256-bit output
  salt_length: 16     # 128-bit salt
```

**Why Argon2id:**
- Memory-hard (resists GPU attacks)
- Time-hard (resists ASIC attacks)
- Resistant to side-channel attacks
- Winner of Password Hashing Competition

### 6.2 Password Storage Format

```
$argon2id$v=19$m=65536,t=3,p=4$[base64_salt]$[base64_hash]
```

### 6.3 Migration from Legacy

If migrating from bcrypt:
1. Verify on login with bcrypt
2. Re-hash with Argon2id
3. Update stored hash
4. Mark account as migrated

## 7. Application-Level Encryption

### 7.1 Document Encryption

**Envelope Encryption:**
```
1. Generate random DEK (256-bit)
2. Encrypt document with DEK (AES-256-GCM)
3. Encrypt DEK with organization KEK
4. Store: encrypted_document + encrypted_dek + iv + tag
```

**Document Format:**
```json
{
  "version": 1,
  "algorithm": "AES-256-GCM",
  "encrypted_key": "base64_encrypted_dek",
  "iv": "base64_iv",
  "tag": "base64_auth_tag",
  "ciphertext": "base64_encrypted_content",
  "metadata": {
    "classification": "PRIVILEGED",
    "encrypted_at": "2026-02-02T00:00:00Z"
  }
}
```

### 7.2 Field-Level Encryption

**Deterministic Encryption (Searchable):**
```
Used for: exact match queries (email lookup)
Algorithm: AES-256-SIV
Key: Field-specific key + tenant key
```

**Randomized Encryption (Non-searchable):**
```
Used for: high-sensitivity fields (SSN)
Algorithm: AES-256-GCM
Key: Field-specific key + tenant key
IV: Unique per encryption
```

### 7.3 JWT Security

**Access Tokens:**
```yaml
Algorithm: HS512 (symmetric) or RS256 (asymmetric)
Key Size: 512-bit (HS512) or 4096-bit (RS256)
Expiration: 15 minutes
Claims: sub, org, sid, roles, iat, exp, jti
```

**Refresh Tokens:**
```yaml
Algorithm: HS512
Key Size: 512-bit
Expiration: 7 days
Rotation: On each use
Family Tracking: For token replay detection
```

## 8. Cryptographic Implementation Guidelines

### 8.1 Secure Coding Practices

**DO:**
- Use established cryptographic libraries (Node.js crypto, libsodium)
- Generate IVs/nonces using CSPRNG
- Use authenticated encryption (GCM, CCM, Poly1305)
- Validate all cryptographic parameters
- Handle cryptographic errors securely
- Use constant-time comparison for secrets

**DO NOT:**
- Implement custom cryptographic algorithms
- Reuse IVs/nonces
- Use ECB mode
- Store keys in source code
- Log cryptographic keys or secrets
- Use Math.random() for cryptographic purposes

### 8.2 Example: Secure Encryption (TypeScript)

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encrypt(plaintext: Buffer, key: Buffer): EncryptedData {
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return { ciphertext, iv, tag };
}

function decrypt(data: EncryptedData, key: Buffer): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', key, data.iv);
  decipher.setAuthTag(data.tag);

  return Buffer.concat([
    decipher.update(data.ciphertext),
    decipher.final()
  ]);
}
```

## 9. Compliance Mapping

| Standard | Requirement | IRONCLAD Implementation |
|----------|-------------|------------------------|
| PCI DSS 4.0 | Strong cryptography | AES-256-GCM, TLS 1.3 |
| NIST 800-53 | SC-13 Cryptographic Protection | Full implementation |
| SOC 2 | CC6.1 Encryption | Documented controls |
| GDPR Art. 32 | Pseudonymization and encryption | Field-level encryption |

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-02 | @Ralph | Initial release |

---

**Approved By:** [Security Officer]
**Next Review:** 2026-08-02
