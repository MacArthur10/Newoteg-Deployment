# Test API Endpoints

## 1. Register a Customer

```bash
curl -X POST http://localhost:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test Customer\",\"phone\":\"+1234567890\"}"
```

## 2. Login

```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Save the `accessToken` from the response!**

## 3. List Products (Public)

```bash
curl http://localhost:3000/products
```

## 4. Get Product Details (Public)

```bash
curl http://localhost:3000/products/{PRODUCT_ID}
```

## 5. Create Reservation (Protected)

Replace `YOUR_TOKEN` with the token from login and `VARIANT_ID` with an actual variant ID from the products list:

```bash
curl -X POST http://localhost:3000/reservations ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"items\":[{\"variantId\":\"VARIANT_ID\",\"quantity\":2}]}"
```

## 6. Get My Reservations (Protected)

```bash
curl http://localhost:3000/reservations/me ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Quick Test Flow

1. Register → Get token
2. List products → Get variant IDs
3. Create reservation with variant IDs
4. Check "my reservations"
5. Wait 30 minutes (or change `RESERVATION_EXPIRY_MINUTES` in .env) to see auto-expiration
