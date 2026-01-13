# Sécurité - Reviews-Maker

## 🔐 Principes de Sécurité

### Top 5 Priorités
1. ✅ Authentification forte
2. ✅ Chiffrement données sensibles
3. ✅ Validation inputs stricte
4. ✅ Protection contre injections
5. ✅ Rate limiting & DDoS protection

---

## 🔑 Authentification & Autorisation

### Password Storage

```javascript
// ✅ CORRECT: Hashing avec bcrypt
const bcrypt = require('bcryptjs');

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// ❌ NEVER: Plain text ou MD5
// ❌ NEVER: Single salt sha256
```

### Session Security

```javascript
// Session options (Express)
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // ✅ Prevent JS access
    secure: true,          // ✅ HTTPS only
    sameSite: 'strict',    // ✅ CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
};
```

### JWT Tokens

```javascript
// ✅ CORRECT
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verification
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
  return res.status(401).json({ error: 'Invalid token' });
}
```

### OAuth Security

```javascript
// Discord OAuth
// ✅ Validate state parameter
// ✅ Use HTTPS callback URL
// ✅ Validate token expiry
// ✅ Refresh token if needed

const OAUTH_CALLBACK_URL = 'https://reviews-maker.com/auth/discord/callback';
```

---

## 🛡️ Input Validation & Sanitization

### Server-side Validation

```javascript
// ✅ ALWAYS validate server-side
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().max(100).required()
});

const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

### SQL Injection Prevention

```javascript
// ✅ Use Prisma (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ❌ NEVER: String concatenation
// const user = await query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### XSS Prevention

```javascript
// React automatically escapes output
// ✅ SAFE
const userName = user.name; // Automatically escaped
<div>{userName}</div>

// ❌ DANGEROUS: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Only use dangerouslySetInnerHTML with sanitized HTML
const DOMPurify = require('isomorphic-dompurify');
const cleanHTML = DOMPurify.sanitize(userInput);
```

### CSRF Protection

```javascript
// ✅ Express with csurf
const csrf = require('csurf');
app.use(csrf());

// In forms:
<input type="hidden" name="_csrf" value={csrfToken} />

// In API requests:
headers: {
  'X-CSRF-Token': csrfToken
}
```

---

## 🔒 HTTPS & SSL/TLS

### Enforce HTTPS

```javascript
// ✅ Redirect HTTP → HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// ✅ Use Helmet for headers
const helmet = require('helmet');
app.use(helmet());
```

### Certificate Management

```bash
# Let's Encrypt (auto-renewal)
sudo certbot certonly --standalone -d reviews-maker.com

# Check expiry
sudo certbot certificates

# Force renew
sudo certbot renew --force-renewal
```

---

## 🚫 Rate Limiting & DDoS

### Express Rate Limiter

```javascript
// ✅ Global rate limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Limit to 100 requests per windowMs
  message: 'Too many requests'
});

app.use('/api/', limiter);

// ✅ Strict limit for auth
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 attempts
  skipSuccessfulRequests: true
});

app.post('/api/auth/login', authLimiter, (req, res) => { ... });
```

### DDoS Protection

```javascript
// Nginx level (more effective)
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

location / {
  limit_req zone=general burst=20;
}

location /api {
  limit_req zone=api burst=50;
}
```

---

## 👤 User Data Privacy

### PII Protection

```javascript
// ✅ Hash sensitive data
const crypto = require('crypto');

function hashEmail(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

// ✅ Encrypt SSN/documents
const encrypedSSN = encrypt(ssn, process.env.ENCRYPTION_KEY);

// ✅ Don't log passwords
console.log(user); // ✅ Password not exposed in JSON
```

### Data Deletion

```javascript
// ✅ Soft delete (GDPR compliant)
const user = await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date(), isActive: false }
});

// ✅ Hard delete after X days
const oldUsers = await prisma.user.findMany({
  where: {
    deletedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  }
});

for (const user of oldUsers) {
  // Delete files
  // Delete from database
  await prisma.user.delete({ where: { id: user.id } });
}
```

### File Upload Security

```javascript
// ✅ Validate file type
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  return res.status(400).json({ error: 'Invalid file type' });
}

// ✅ Limit file size
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_SIZE) {
  return res.status(400).json({ error: 'File too large' });
}

// ✅ Rename files (prevent execution)
const newFileName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}.jpg`;

// ✅ Store outside web root
const uploadPath = '/var/data/uploads/'; // Not in /public
```

---

## 🔐 Environment Variables

### Secrets Management

```bash
# ✅ CORRECT: Use .env file (never commit)
# .env.example (public template)
DATABASE_URL=
JWT_SECRET=
DISCORD_CLIENT_SECRET=

# ✅ Production: Use environment variables
export JWT_SECRET="production-secret-key"

# ❌ NEVER: Hardcode secrets
const JWT_SECRET = "my-secret";

# ❌ NEVER: Commit .env file
# Add to .gitignore:
.env
.env.local
.env.*.local
```

### Rotation

```bash
# Every 90 days, rotate secrets
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Update in production
# 3. Update all clients
# 4. Deprecate old secret (keep for X days)
# 5. Remove old secret
```

---

## 🔍 Security Audit Checklist

- [ ] Toutes les inputs validées (server-side)
- [ ] Pas de SQL injection possible
- [ ] Pas de XSS vulnerabilities
- [ ] CSRF tokens en place
- [ ] HTTPS enforced
- [ ] Passwords hashed (bcrypt)
- [ ] Rate limiting activé
- [ ] Sensitive logs pas exposés
- [ ] .env not committed
- [ ] File uploads validés
- [ ] CORS properly configured
- [ ] No hardcoded secrets
- [ ] API authentication required
- [ ] User can't access others' data
- [ ] Old sessions cleaned up

---

## 🔄 Security Updates

### Dependencies

```bash
# Check vulnerabilities
npm audit

# Fix auto-fixable
npm audit fix

# Review and update major versions
npm outdated

# Update single package
npm update lodash
```

### Node.js & OS

```bash
# Keep Node.js updated (LTS)
node --version  # Should be latest LTS

# Ubuntu updates
sudo apt update && sudo apt upgrade
```

---

## 🚨 Incident Response

### If Breach Suspected

1. **Immediate**
   - [ ] Disable affected account
   - [ ] Rotate all secrets
   - [ ] Enable enhanced logging
   - [ ] Check access logs

2. **Short-term**
   - [ ] Audit database for tampering
   - [ ] Notify affected users
   - [ ] Force password reset
   - [ ] Review security logs

3. **Long-term**
   - [ ] Post-mortem analysis
   - [ ] Implement additional controls
   - [ ] Security training
   - [ ] Update docs

---

## 📚 Security Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE/SANS: https://cwe.mitre.org/
- Node.js Security: https://nodejs.org/en/docs/guides/security/
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html

---

**Dernière mise à jour**: 13 Jan 2026

**Questions de sécurité?** Consultez OWASP ou l'équipe de sécurité.
