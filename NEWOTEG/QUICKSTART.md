# 🚀 Quick Start Guide - NEWOTEG E-Commerce Backend

## Prerequisites
- Node.js 18+ and npm installed
- PostgreSQL database (Neon PostgreSQL configured in `.env`)
- Environment variables configured

## Setup & Launch (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Reset and migrate database
npx prisma db push --force-reset

# Seed with sample data and admin user
npm run seed
```

### 3. Start Development Server
```bash
npm run start:dev
```

Server runs on **http://localhost:3000**

---

## 📝 Admin Credentials

After seeding, use these credentials to test:
```
Email: admin@example.com
Password: Admin@123
```

---

## 🧪 Testing Endpoints

### 1. Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

Save the returned `access_token` for authenticated requests.

### 2. Get Admin Dashboard
```bash
curl -X GET http://localhost:3000/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create a Product (Admin Only)
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "category": "Electronics"
  }'
```

### 4. List Public Products (No Auth)
```bash
curl -X GET http://localhost:3000/products
```

---

## 📊 Available Endpoints

### Authentication
- `POST /auth/register` - Register new customer
- `POST /auth/login` - Login (returns JWT)

### Products (Public)
- `GET /products` - List all products
- `GET /products/:id` - Get product details

### Products (Admin)
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:productId/variants` - Create variant
- `GET /products/admin/all` - List all products

### Reservations
- `POST /reservations` - Create reservation
- `GET /reservations/me` - My reservations
- `PUT /reservations/:id/status` - Update status (admin)
- `GET /reservations/admin/all` - All reservations (admin)

### Admin Dashboard
- `GET /admin/dashboard` - Stats & overview
- `GET /admin/products` - Product list with variants
- `GET /admin/users` - User list
- `GET /admin/reservations` - Reservation list
- `GET /admin/analytics/revenue` - Revenue breakdown

---

## 🛠️ Useful Commands

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reseed database
npm run seed

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate dev --name migration_name
```

---

## 📁 Project Structure

```
src/
├── auth/           - Authentication & JWT
├── products/       - Product management
├── reservations/   - Reservation system
├── admin/          - Admin dashboard
├── prisma/         - Database service
└── common/         - Shared code

prisma/
├── schema.prisma   - Database schema
└── seed.ts         - Database seeding
```

---

## 🔒 Default Configuration

```
PORT=3000
STORE_ID=default-store
RESERVATION_EXPIRY_MINUTES=30
JWT_SECRET=your-secret-key
```

Set these in `.env` file before starting.

---

## ✅ Status Check

The system is ready when you see:
```
[Nest] ... Nest application successfully started
[Nest] ... ✅ Database connected successfully
```

---

## 📚 Full Documentation

See **SYSTEM_DOCUMENTATION.md** for complete API reference and architecture details.

---

**Ready to roll! 🎉**
