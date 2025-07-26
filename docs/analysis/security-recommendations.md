# Security Recommendations

## Priority: HIGH IMPACT

### 1. Express Security Hardening

**Current State**: Missing basic security headers and protections
**Risk**: Vulnerable to common attacks (XSS, CSRF, clickjacking)

**Recommendations**:

- Add `helmet()` middleware for security headers
- Implement CORS with explicit origin whitelist
- Add rate limiting for authentication endpoints
- Enable secure session cookies

```typescript
// Add to app.ts after express.json()
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  }),
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }),
);
```

### 2. Authentication & JWT Security

**Current State**: JWT_SECRET is optional, potential for weak secrets
**Risk**: Authentication bypass, token manipulation

**Recommendations**:

- Make JWT_SECRET mandatory with minimum length
- Implement token rotation
- Add blacklist for revoked tokens

```typescript
// In env.schema.ts
JWT_SECRET: z.string()
  .min(32)
  .refine((val) => val !== "changeme" && val !== "secret", "JWT_SECRET must be a strong secret");
```

### 3. Input Validation & Sanitization

**Current State**: Basic Zod validation, potential XSS in SSR
**Risk**: Code injection, data corruption

**Recommendations**:

- Sanitize all user inputs
- Escape SSR template outputs
- Add request size limits
- Implement SQL injection prevention

### 4. Session Management

**Current State**: Basic session config, missing security flags
**Risk**: Session hijacking, CSRF attacks

**Recommendations**:

- Set secure cookie flags
- Implement session regeneration
- Add CSRF protection
- Configure proper session timeout
