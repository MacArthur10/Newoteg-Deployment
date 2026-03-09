# NEWOTEG Unified Backend

Complete e-commerce and inventory management system combining authentication, product management, sales, and inventory tracking.

## Features

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Role-based access control (Admin, Cashier, Customer)
- Secure password hashing with bcrypt

### 📦 Product Management
- Product categories with descriptions
- Product variants with SKU tracking
- Dynamic product attributes (color, size, dimensions, etc.)
- Barcode support
- Low stock thresholds

### 👥 Customer & Supplier Management
- Customer profiles with points system
- Link users to customers for integrated auth
- Supplier management
- Customer purchase history

### 💳 Sales Management
- Complete sale transactions with line items
- Multiple payment methods (Cash, Card, Bank Transfer, Mobile Money)
- Payment status tracking (Paid, Partial, Pending)
- Discount support
- Customer-based sales tracking

### 📥 Purchase Management
- Purchase orders from suppliers
- Detailed purchase tracking
- Payment status for purchases
- Due date management

### 📊 Inventory Management
- Real-time stock tracking
- Stock movement history (In, Out, Adjustment, Damage)
- Low stock alerts
- Purchase and sale integration

### 🎫 Reservation System
- Online product reservations
- Auto-expiry (30 minutes default)
- Reservation tracking and management
- Status management (Active, Expired, Completed, Cancelled)

### 💰 Cash Register
- Cash flow tracking
- Sale-to-cash reconciliation
- Transaction logging

### 📋 Audit & Compliance
- Complete audit logging
- Change tracking
- User action history

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with Neon
- **ORM:** Prisma with connection pooling
- **Authentication:** JWT + Passport
- **Language:** TypeScript
- **Validation:** Class-validator

## Project Structure

```
src/
├── auth/              # Authentication & JWT
├── products/          # Product management
├── categories/        # Product categories
├── attributes/        # Product attributes
├── clients/           # Customer management
├── suppliers/         # Supplier management
├── purchases/         # Purchase orders
├── sales/             # Sale transactions
├── inventory/         # Stock management
├── database/          # Database service
└── common/            # Shared utilities
```

## Installation

```bash
npm install
```

## Environment Setup

Create `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=4000
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"
API_PREFIX="api"
RESERVATION_EXPIRY_MINUTES=30
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Database Setup

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Run Migrations
```bash
npm run prisma:migrate
```

### Seed Database
```bash
npm run prisma:seed
```

### Open Prisma Studio
```bash
npm run prisma:studio
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category (Admin)
- `PATCH /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Sales
- `GET /api/sales` - Get all sales (Admin)
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create sale
- `PATCH /api/sales/:id` - Update sale (Admin)

### Purchases
- `GET /api/purchases` - Get all purchases (Admin)
- `POST /api/purchases` - Create purchase (Admin)
- `PATCH /api/purchases/:id` - Update purchase (Admin)

### Reservations
- `POST /api/reservations` - Create reservation (Customer)
- `GET /api/reservations/me` - Get my reservations
- `GET /api/reservations` - Get all reservations (Admin)
- `PATCH /api/reservations/:id/status` - Update status (Admin)

### Inventory
- `GET /api/inventory/stock` - Get stock status
- `GET /api/inventory/movements` - Get stock movements
- `POST /api/inventory/adjust` - Adjust stock (Admin)

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/analytics/inventory` - Inventory analytics

## Architecture Highlights

### Connection Pooling
- Uses `pg` Pool with connection pooling
- Optimized for Neon PostgreSQL
- 10 max concurrent connections
- 30-second idle timeout

### Database Relations
- Comprehensive relational design
- Cascading deletes where appropriate
- Proper foreign key constraints
- Indexed for performance

### Audit Trail
- All critical operations logged
- User action tracking
- IP logging
- Change tracking

## Future Enhancements

- [ ] GraphQL API support
- [ ] Advanced analytics dashboard
- [ ] Multi-store support
- [ ] Bulk operations
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Inventory forecasting
- [ ] Supplier performance metrics

## License

UNLICENSED

## Support

For issues or questions, contact: support@newoteg.com
