You are a senior backend architect.

We are building a SaaS POS with an integrated e-commerce system using:

- NestJS
- PostgreSQL
- Prisma ORM
- JWT authentication
- Multi-tenant architecture (store_id everywhere)

We are starting with the e-commerce module only (online mode only).

Your task is to implement:

1) Customer registration and login
2) Product public listing
3) Product details
4) Reservation system

Important architecture rules:

- Every table must contain store_id
- Use UUID as primary keys
- Include created_at and updated_at
- Use soft logic with status fields instead of hard deletes
- Code must be modular and future-proof
- No tight coupling between modules

Entities required:

User:
- id
- store_id
- email
- password_hash
- full_name
- phone
- role (CUSTOMER | ADMIN | CASHIER)

Product:
- id
- store_id
- name
- description
- category
- is_active

ProductVariant:
- id
- product_id
- sku
- price
- stock
- is_active

Reservation:
- id
- store_id
- customer_id
- status (PENDING | CONFIRMED | CANCELLED | EXPIRED)
- total_amount
- expires_at

ReservationItem:
- id
- reservation_id
- variant_id
- quantity
- unit_price
- total_price

Business rules:

- When a reservation is created, stock must be decreased immediately.
- If reservation expires, stock must be restored.
- Use transactions for reservation creation.
- Validate stock before reservation.
- Protect all endpoints with JWT except public product listing.

Endpoints to implement:

POST /auth/register
POST /auth/login
GET  /products
GET  /products/:id
POST /reservations
GET  /reservations/me

Use clean architecture:
- controllers
- services
- modules
- DTO validation

Write production-ready code.