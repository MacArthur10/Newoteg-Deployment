# NEWOTEG - E-Commerce Backend (Single Store)

A production-ready NestJS + PostgreSQL + Prisma backend for an e-commerce system with customer authentication, product catalog, and reservation functionality.

## Features

✅ **Authentication**: Customer registration & JWT-based login  
✅ **Products**: Public product listing and details  
✅ **Reservations**: Create reservations with automatic stock management  
✅ **Auto-expiration**: Pending reservations auto-expire and restore stock  
✅ **Transaction Safety**: Stock updates use database transactions  
✅ **Validation**: Request DTOs validated with class-validator  

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma v6.16.2
- **Auth**: JWT (passport-jwt)
- **Validation**: class-validator + class-transformer

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Set `JWT_SECRET` to a secure random string

3. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   ```

4. **Start development server**:
   ```bash
   npm run start:dev
   ```

Server runs on `http://localhost:3000`

## API Endpoints

### Authentication

#### Register Customer
```http
POST /auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "storeId": "default-store",
    "email": "customer@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "securepassword123"
}
```

### Products (Public)

#### List All Products
```http
GET /products
```

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "category": "Electronics",
    "variants": [
      {
        "id": "uuid",
        "sku": "PROD-001",
        "price": "99.99",
        "stock": 50
      }
    ]
  }
]
```

#### Get Product Details
```http
GET /products/:id
```

### Reservations (Protected)

#### Create Reservation
```http
POST /reservations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "items": [
    {
      "variantId": "uuid",
      "quantity": 2
    },
    {
      "variantId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response**:
```json
{
  "id": "uuid",
  "storeId": "default-store",
  "customerId": "uuid",
  "status": "PENDING",
  "totalAmount": "299.97",
  "expiresAt": "2026-03-03T11:36:00.000Z",
  "createdAt": "2026-03-03T11:06:00.000Z",
  "items": [...]
}
```

#### Get My Reservations
```http
GET /reservations/me
Authorization: Bearer {accessToken}
```

## Database Schema

### Key Tables

- **users**: Customer accounts with email/password
- **products**: Product catalog with name, description, category
- **product_variants**: SKU-level variants with price and stock
- **reservations**: Customer reservations with expiry tracking
- **reservation_items**: Line items for each reservation

### Business Rules

1. **Stock Management**: Stock decreases immediately when reservation is created
2. **Auto-Expiration**: Reservations expire after 30 minutes (configurable)
3. **Stock Restoration**: Expired reservations automatically restore stock
4. **Soft Deletes**: Uses status fields instead of hard deletes
5. **Single Store**: All data belongs to `STORE_ID` environment variable

## Scripts

```bash
npm run build              # Build TypeScript to dist/
npm run start              # Run production build
npm run start:dev          # Run development with hot reload
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio GUI
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | `change-this-secret` |
| `PORT` | Server port | `3000` |
| `STORE_ID` | Single store identifier | `default-store` |
| `RESERVATION_EXPIRY_MINUTES` | Reservation timeout | `30` |

## Testing with cURL

```bash
# Register a customer
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# List products (public)
curl http://localhost:3000/products

# Create reservation (requires token)
curl -X POST http://localhost:3000/reservations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"variantId":"VARIANT_UUID","quantity":1}]}'
```

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── dto/              # Login & register DTOs
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── products/             # Product catalog module
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── reservations/         # Reservation management
│   ├── dto/
│   ├── reservations.controller.ts
│   ├── reservations.service.ts
│   └── reservations.module.ts
├── prisma/              # Prisma client setup
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/              # Shared utilities
│   ├── decorators/
│   └── types/
├── app.module.ts
└── main.ts
```

## Next Steps

To make this production-ready:

1. **Add Seed Data**: Create sample products and variants
2. **Add Admin Endpoints**: Product/variant CRUD operations
3. **Implement Order Conversion**: Convert confirmed reservations to orders
4. **Add Payment Integration**: Stripe, PayPal, etc.
5. **Add Email Notifications**: Reservation confirmations and expiry warnings
6. **Add Rate Limiting**: Prevent abuse on public endpoints
7. **Add Logging**: Winston or Pino for structured logging
8. **Add Tests**: Unit and E2E tests with Jest

## License

ISC
