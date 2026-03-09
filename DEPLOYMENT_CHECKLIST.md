# 🚀 NEWOTEG Deployment Checklist

## Before Pushing to GitHub

### 1. Environment Variables Setup ✅

#### Backend (NEWOTEG-UNIFIED)
Create `.env` file from `.env.example`:
```bash
cd NEWOTEG-UNIFIED
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

#### Frontend (NEWOTEG-ECOMMERCE)
Create `.env` file from `.env.example`:
```bash
cd NEWOTEG-ECOMMERCE
cp .env.example .env
```

**Required Variables:**
- `VITE_API_URL` - Backend API URL (e.g., `https://api.yourdomain.com/api`)

### 2. Security Check ✅

- [ ] Verify `.env` files are in `.gitignore`
- [ ] Check no sensitive credentials in code
- [ ] Review `.gitignore` files are complete
- [ ] Remove any hardcoded API keys or passwords
- [ ] Change default admin password after first deployment

### 3. CORS Configuration 🔧

Update CORS in `NEWOTEG-UNIFIED/src/main.ts` for production:

```typescript
// Replace:
app.enableCors({
  origin: '*',  // ⚠️ Development only
  credentials: true,
});

// With:
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-domain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

Add to `.env`:
```
CORS_ORIGIN="https://your-frontend-domain.com"
```

### 4. Build Verification ✅

Test both projects build successfully:

```bash
# Backend
cd NEWOTEG-UNIFIED
npm run build

# Frontend
cd NEWOTEG-ECOMMERCE
npm run build
```

### 5. Database Preparation ✅

Ensure migrations are ready:
```bash
cd NEWOTEG-UNIFIED
npx prisma migrate deploy  # For production
npx prisma generate
```

### 6. Code Quality ✅

Run linters:
```bash
# Frontend
cd NEWOTEG-ECOMMERCE
npm run lint

# Check for TypeScript errors
npm run type-check  # if available
```

### 7. Git Preparation 📦

```bash
# Check git status
git status

# Add all changes
git add .

# Commit with meaningful message
git commit -m "feat: Add FCFA currency, sales history, and profile management"

# Push to GitHub
git push origin main  # or your branch name
```

---

## Deployment Steps

### Backend Deployment (Recommended: Railway/Render/Vercel)

#### Option 1: Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `NEWOTEG-UNIFIED` folder
4. Add environment variables from `.env`
5. Deploy

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Root directory: `NEWOTEG-UNIFIED`
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npm run start:prod`
6. Add environment variables
7. Deploy

#### Option 3: Vercel (Serverless)
```bash
cd NEWOTEG-UNIFIED
vercel --prod
```

### Frontend Deployment (Recommended: Vercel/Netlify)

#### Option 1: Vercel
```bash
cd NEWOTEG-ECOMMERCE
vercel --prod
```

#### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. New site from Git → Select repo
3. Base directory: `NEWOTEG-ECOMMERCE`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
7. Deploy

---

## Post-Deployment

### 1. Update Frontend API URL
After backend is deployed, update frontend `.env.production` or deployment platform:
```
VITE_API_URL="https://your-backend-domain.com/api"
```

### 2. Update Backend CORS
Update `CORS_ORIGIN` environment variable with your deployed frontend URL:
```
CORS_ORIGIN="https://your-frontend-domain.com"
```

### 3. Database Migration
Run migrations on production database:
```bash
npx prisma migrate deploy
```

### 4. Seed Data (if needed)
```bash
npx prisma db seed
```

### 5. Test Deployed Application

- [ ] Admin login works
- [ ] Product creation with images (Cloudinary)
- [ ] Sales history displays correctly
- [ ] All prices show in FCFA format
- [ ] Profile page loads and avatar upload works
- [ ] Reservations/Orders work end-to-end

### 6. Change Default Credentials
Login with `admin@newoteg.com` / `Admin123456` and immediately:
1. Go to Settings
2. Update admin profile
3. Change password (if password change is implemented)

---

## Environment Variables Reference

### Backend (NEWOTEG-UNIFIED)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT signing secret | ✅ | `64-char-random-string` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ | `abcdefghijklmnop` |
| `PORT` | Server port | ❌ | `4000` |
| `API_PREFIX` | API path prefix | ❌ | `api` |
| `NODE_ENV` | Environment | ❌ | `production` |
| `CORS_ORIGIN` | Allowed frontend URL | ⚠️ Prod | `https://app.com` |

### Frontend (NEWOTEG-ECOMMERCE)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API endpoint | ✅ | `https://api.domain.com/api` |

---

## Troubleshooting

### Build Errors
- Check Node.js version (v18+ recommended)
- Clear `node_modules`: `rm -rf node_modules package-lock.json && npm install`
- Check `prisma generate` ran successfully

### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check protocol (http vs https)
- Ensure no trailing slashes

### Database Connection
- Verify Neon database is accessible
- Check SSL mode in connection string: `?sslmode=require`
- Confirm IP allowlist if using restrictive database

### Cloudinary Uploads Failing
- Verify all 3 Cloudinary env variables are set
- Check API key format (no spaces)
- Test credentials in Cloudinary console

---

## 🎉 You're Ready!

Once all checks pass, your NEWOTEG application is ready for deployment!

**Key Features Implemented:**
- ✅ Sales History Tab with FCFA formatting
- ✅ All prices in FCFA currency
- ✅ Profile management with avatar upload
- ✅ Cloudinary image storage
- ✅ JWT authentication
- ✅ PostgreSQL database with Prisma
- ✅ Admin dashboard for e-commerce management
