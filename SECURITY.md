# SuperDash Security Architecture & Incident Response Policy

*Version: 1.7.1 | Status: Active | Classification: Public Security Policy & Technical Reference*

---

## 1. Executive Summary & Security Philosophy

SuperDash is architected on a **local-first, zero-trust client model**. Rather than maintaining remote centralized relational databases or backend API keys in client-side code where exposure risks are high, all operational data (notes, tasks, collections, financial records, clients, time tracking, growth leads) resides primarily in sandboxed browser client storage (IndexedDB and LocalStorage) or directly on the user's host operating system via the File System Access API.

### Core Security Tenets
1. **Zero Frontend Secrets**: No backend administrative credentials, private API keys, database access tokens, or Cloudflare tokens are bundled or exposed in client bundles.
2. **Defense in Depth**: Client-side content parsing enforces strict whitelist-based HTML sanitization before any DOM rendering, preventing Cross-Site Scripting (XSS).
3. **End-to-End Encryption at Rest & in Transit**: Exported `.superdash` archives are protected with authenticated AES-256-GCM encryption paired with PBKDF2 key derivation (100,000 iterations). Web traffic is constrained by strict Content Security Policies and HSTS headers.
4. **Brute-Force & Denial-of-Access Resistance**: Local PIN authentication employs cryptographically random salts, Web Crypto SHA-256 digest hashing, and exponential lockout penalties to defeat automated brute-force attacks.
5. **No 100% Security Claims**: In accordance with rigorous engineering ethics, SuperDash is continuously hardened and updated to reflect defensive best practices while acknowledging evolving threat landscapes.

---

## 2. Threat Model & Assumptions

The security architecture assumes a hostile operating environment:
- **Public Git Repository**: The complete source repository on GitHub is assumed to be publicly inspectable by security researchers and threat actors.
- **Client Bundle Decompilation**: Attackers can inspect, disassemble, and manipulate all frontend JavaScript, WebAssembly, HTML, and CSS assets.
- **Man-in-the-Middle (MitM) & Network Inspection**: Browser network traffic can be inspected on untrusted Wi-Fi networks.
- **Local Storage Exposure**: Physical access or malicious browser extensions could inspect `localStorage` or `IndexedDB` when a host device is unlocked.
- **XSS & Injection Vectors**: Untrusted inputs (imported files, pasted rich text, imported backups) may attempt to execute arbitrary JavaScript or exploit DOM rendering.

---

## 3. Threat Assessment & Mitigation Matrix

| Threat Category | Potential Attack Vector | SuperDash Mitigation Mechanism | File / Component Reference |
| :--- | :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** | Injected `<script>`, `onerror`, `onload`, `javascript:` URI in rich-text notes or imported data | Native DOMParser whitelist-based sanitizer stripping all disallowed tags, event handlers, and pseudoprotocols | [`src/services/security/sanitizer.ts`](file:///E:/DashTools/SuperDash/src/services/security/sanitizer.ts), [`src/apps/plan/PlanApp.tsx`](file:///E:/DashTools/SuperDash/src/apps/plan/PlanApp.tsx) |
| **Credential Theft & Brute Force** | Dictionary / brute-force PIN guessing on SuperDash App Lock screen | Web Crypto SHA-256 with 16-byte random salt, 5-attempt threshold triggering exponential lockout timers up to 300s | [`src/services/security/index.ts`](file:///E:/DashTools/SuperDash/src/services/security/index.ts), [`src/components/Security/AppLockScreen.tsx`](file:///E:/DashTools/SuperDash/src/components/Security/AppLockScreen.tsx) |
| **Backup Eavesdropping** | Extraction of sensitive finance/notes data from exported backup files | AES-256-GCM authenticated encryption using PBKDF2 (100,000 rounds) key derivation and user passphrase | [`src/services/backup/index.ts`](file:///E:/DashTools/SuperDash/src/services/backup/index.ts), [`src/apps/settings/DataBackupSettings.tsx`](file:///E:/DashTools/SuperDash/src/apps/settings/DataBackupSettings.tsx) |
| **Clickjacking & Framing** | Embedding SuperDash in malicious iframes | Cloudflare `_headers` enforcing `X-Frame-Options: DENY` and `frame-ancestors 'none'` | [`public/_headers`](file:///E:/DashTools/SuperDash/public/_headers) |
| **MIME Sniffing** | Browser interpreting non-executable resources as executable | `X-Content-Type-Options: nosniff` header | [`public/_headers`](file:///E:/DashTools/SuperDash/public/_headers) |
| **Secret Leaks in Git** | Accidental commit of API keys, `.env`, certificates, or keystores | Hardened `.gitignore` excluding all `.env*`, `.dev.vars`, `*.key`, `*.pem`, `*.keystore`, `*.jks` | [`.gitignore`](file:///E:/DashTools/SuperDash/.gitignore) |
| **Unauthorized Device Sensor Access** | Malicious scripts attempting microphone/camera eavesdropping | `Permissions-Policy: camera=(), microphone=(), geolocation=()` disabling sensitive browser APIs | [`public/_headers`](file:///E:/DashTools/SuperDash/public/_headers) |

---

## 4. Cryptographic Standards & Specifications

### 4.1 PIN Hashing
- **Algorithm**: SHA-256 via W3C Web Cryptography API (`crypto.subtle.digest`).
- **Salt Generation**: 16 bytes (128 bits) of cryptographically secure pseudo-random entropy generated via `crypto.getRandomValues(new Uint8Array(16))`.
- **Storage**: Salt and hash are persisted in hex format in local storage; plaintext PIN is discarded immediately from memory upon computation.

### 4.2 Backup Archive Encryption
- **Cipher**: AES-256-GCM (Galois/Counter Mode), providing both confidentiality and integrity authentication.
- **Key Derivation**: PBKDF2 (Password-Based Key Derivation Function 2) with HMAC-SHA-256.
  - **Salt**: 16 cryptographically random bytes per encrypted archive.
  - **Iteration Count**: 100,000 iterations (exceeding OWASP minimum requirements).
  - **Derived Key Length**: 256 bits.
- **Initialization Vector (IV)**: 12 bytes (96 bits) uniquely generated for every encryption pass using `crypto.getRandomValues`.
- **Payload Structure**:
  ```json
  {
    "manifest": { "backupVersion": "1.7.0", "encrypted": true, ... },
    "data": {
      "ciphertext": "base64EncodedGcmPayloadWithAuthTag",
      "salt": "hexEncoded16ByteSalt",
      "iv": "hexEncoded12ByteIv"
    }
  }
  ```

---

## 5. Content Security Policy (CSP) & HTTP Headers

SuperDash deploys the following headers across all Cloudflare Pages edge locations via `public/_headers`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com; connect-src 'self' https://superdash-ero.pages.dev https://raw.githubusercontent.com https://elamranioth.github.io https://api.mymemory.translated.net https://translate.googleapis.com https://api.open-meteo.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()
```

---

## 6. Incident Response & Vulnerability Reporting

If you believe you have found a security vulnerability in SuperDash, please do **NOT** open a public issue on GitHub. Instead, report it responsibly:

1. **Contact**: Open a confidential security advisory via GitHub Security Advisories at `https://github.com/elamranioth/SuperDash/security/advisories`.
2. **Information to Include**:
   - Description of the vulnerability and attack vector.
   - Proof-of-concept steps or exploit scripts.
   - Impact assessment on user confidentiality or integrity.
   - Operating system and browser versions tested.
3. **Response Timeline**:
   - Acknowledgment: Within 48 hours.
   - Vulnerability Assessment: Within 5 business days.
   - Remediation Release: Target within 14 business days depending on severity.
