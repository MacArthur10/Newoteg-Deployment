# 📋 API Response Examples - Reservation Pricing

## Complete Pricing Information in All Endpoints

---

## 1. Customer Creates Reservation

**Endpoint:** `POST /reservations`  
**Auth:** Customer JWT Token Required

### Request:
```json
{
  "items": [
    {
      "variantId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    }
  ]
}
```

### Response (201 Created):
```json
{
  "id": "reservation-uuid-here",
  "storeId": "default-store",
  "customerId": "customer-uuid-here",
  "status": "PENDING",
  "totalAmount": "599.98",           // ✅ TOTAL COST OF RESERVATION
  "expiresAt": "2026-03-03T12:30:00.000Z",
  "createdAt": "2026-03-03T12:00:00.000Z",
  "updatedAt": "2026-03-03T12:00:00.000Z",
  "items": [
    {
      "id": "item-uuid-here",
      "storeId": "default-store",
      "reservationId": "reservation-uuid-here",
      "variantId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2,
      "unitPrice": "299.99",         // ✅ PRICE PER UNIT (locked at reservation time)
      "totalPrice": "599.98",        // ✅ quantity × unitPrice
      "createdAt": "2026-03-03T12:00:00.000Z"
    }
  ]
}
```

### Pricing Fields Explained:
- **`totalAmount`**: Total cost for entire reservation (sum of all item totals)
- **`unitPrice`**: Price per unit at the time of reservation (frozen/locked price)
- **`totalPrice`**: Line item total (quantity × unitPrice)

---

## 2. Customer Gets Their Reservations

**Endpoint:** `GET /reservations/me`  
**Auth:** Customer JWT Token Required

### Response (200 OK):
```json
[
  {
    "id": "reservation-uuid-1",
    "storeId": "default-store",
    "customerId": "customer-uuid",
    "status": "PENDING",
    "totalAmount": "599.98",         // ✅ TOTAL AMOUNT
    "expiresAt": "2026-03-03T12:30:00.000Z",
    "createdAt": "2026-03-03T12:00:00.000Z",
    "updatedAt": "2026-03-03T12:00:00.000Z",
    "items": [
      {
        "id": "item-uuid-1",
        "storeId": "default-store",
        "reservationId": "reservation-uuid-1",
        "variantId": "variant-uuid-1",
        "quantity": 2,
        "unitPrice": "299.99",       // ✅ LOCKED PRICE (price at reservation time)
        "totalPrice": "599.98",      // ✅ quantity × unitPrice
        "createdAt": "2026-03-03T12:00:00.000Z",
        "variant": {                 // ✅ CURRENT VARIANT INFO
          "id": "variant-uuid-1",
          "sku": "LAPTOP-PRO-X1-I5",
          "price": "299.99"          // ✅ CURRENT PRICE (may differ from unitPrice)
        }
      }
    ]
  },
  {
    "id": "reservation-uuid-2",
    "status": "CONFIRMED",
    "totalAmount": "149.98",
    "expiresAt": "2026-03-02T15:00:00.000Z",
    "items": [
      {
        "quantity": 1,
        "unitPrice": "149.98",
        "totalPrice": "149.98",
        "variant": {
          "sku": "MOUSE-PRO-BLACK",
          "price": "149.98"
        }
      }
    ]
  }
]
```

### Note:
- **`unitPrice`**: The price frozen at reservation time (won't change even if product price is updated)
- **`variant.price`**: The current product price (admin may have changed it after reservation)
- If prices differ, customer still pays the `unitPrice` they reserved at

---

## 3. Admin Gets All Reservations

**Endpoint:** `GET /reservations/admin/all`  
**Auth:** Admin JWT Token Required

### Response (200 OK):
```json
[
  {
    "id": "reservation-uuid-1",
    "storeId": "default-store",
    "customerId": "customer-uuid-1",
    "status": "CONFIRMED",
    "totalAmount": "599.98",                    // ✅ TOTAL RESERVATION AMOUNT
    "expiresAt": "2026-03-03T12:30:00.000Z",
    "createdAt": "2026-03-03T12:00:00.000Z",
    "updatedAt": "2026-03-03T12:05:00.000Z",
    "customer": {                               // ✅ CUSTOMER DETAILS
      "id": "customer-uuid-1",
      "email": "customer@example.com",
      "fullName": "John Doe",
      "phone": "+1234567890"
    },
    "items": [
      {
        "id": "item-uuid-1",
        "storeId": "default-store",
        "reservationId": "reservation-uuid-1",
        "variantId": "variant-uuid-1",
        "quantity": 2,
        "unitPrice": "299.99",                  // ✅ LOCKED PRICE AT RESERVATION
        "totalPrice": "599.98",                 // ✅ ITEM TOTAL
        "createdAt": "2026-03-03T12:00:00.000Z",
        "variant": {                            // ✅ VARIANT + PRODUCT INFO
          "id": "variant-uuid-1",
          "sku": "LAPTOP-PRO-X1-I5",
          "price": "299.99",                    // ✅ CURRENT PRICE
          "product": {                          // ✅ PRODUCT DETAILS
            "id": "product-uuid-1",
            "name": "Laptop Pro X1",
            "category": "Electronics"
          }
        }
      }
    ]
  },
  {
    "id": "reservation-uuid-2",
    "customerId": "customer-uuid-2",
    "status": "PENDING",
    "totalAmount": "449.97",
    "expiresAt": "2026-03-03T13:00:00.000Z",
    "customer": {
      "email": "another@example.com",
      "fullName": "Jane Smith",
      "phone": "+0987654321"
    },
    "items": [
      {
        "quantity": 3,
        "unitPrice": "149.99",
        "totalPrice": "449.97",
        "variant": {
          "sku": "MOUSE-PRO-WHITE",
          "price": "149.99",
          "product": {
            "name": "Wireless Mouse Pro",
            "category": "Accessories"
          }
        }
      }
    ]
  }
]
```

### Admin-Specific Information:
- **Customer details**: Full customer information (email, name, phone)
- **Product details**: Product name and category for each variant
- **All pricing**: Both locked `unitPrice` and current `variant.price`
- **All statuses**: PENDING, CONFIRMED, CANCELLED, EXPIRED

---

## 4. Admin Gets Reservations via Dashboard

**Endpoint:** `GET /admin/reservations`  
**Auth:** Admin JWT Token Required

### Response (200 OK):
Same structure as `/reservations/admin/all` above - includes:
- ✅ Customer information
- ✅ Complete pricing (unitPrice, totalPrice, totalAmount)
- ✅ Product name and category
- ✅ SKU and current price

---

## 5. Admin Updates Reservation Status

**Endpoint:** `PUT /reservations/:id/status`  
**Auth:** Admin JWT Token Required

### Request:
```json
{
  "status": "CONFIRMED"
}
```

Valid statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`

### Response (200 OK):
```json
{
  "id": "reservation-uuid",
  "storeId": "default-store",
  "customerId": "customer-uuid",
  "status": "CONFIRMED",                    // ✅ UPDATED STATUS
  "totalAmount": "599.98",
  "expiresAt": "2026-03-03T12:30:00.000Z",
  "createdAt": "2026-03-03T12:00:00.000Z",
  "updatedAt": "2026-03-03T12:10:00.000Z",  // ✅ TIMESTAMP UPDATED
  "items": [
    {
      "id": "item-uuid",
      "variantId": "variant-uuid",
      "quantity": 2,
      "unitPrice": "299.99",                // ✅ PRICE PRESERVED
      "totalPrice": "599.98",
      "createdAt": "2026-03-03T12:00:00.000Z"
    }
  ]
}
```

### Special Behavior:
- **CANCELLED status**: Automatically restores stock for all items
- Stock is **NOT** restored for `EXPIRED` status (handled by auto-expiration)

---

## 6. Admin Dashboard Stats

**Endpoint:** `GET /admin/dashboard`  
**Auth:** Admin JWT Token Required

### Response (200 OK):
```json
{
  "totalProducts": 5,
  "totalVariants": 8,
  "totalReservations": 12,
  "pendingReservations": 3,
  "confirmedRevenue": "4599.86"           // ✅ SUM OF ALL CONFIRMED RESERVATION AMOUNTS
}
```

---

## 7. Admin Revenue Analytics

**Endpoint:** `GET /admin/analytics/revenue`  
**Auth:** Admin JWT Token Required

### Response (200 OK):
```json
{
  "PENDING": "1199.94",                   // ✅ Total amount of PENDING reservations
  "CONFIRMED": "4599.86",                 // ✅ Total amount of CONFIRMED reservations
  "CANCELLED": "899.95",                  // ✅ Total amount of CANCELLED reservations
  "EXPIRED": "299.99"                     // ✅ Total amount of EXPIRED reservations
}
```

---

## 📊 Pricing Logic Summary

### At Reservation Creation:
1. Current product variant price is retrieved
2. Price is **locked** as `unitPrice` in reservation item
3. `totalPrice` = `quantity` × `unitPrice`
4. `totalAmount` = sum of all `totalPrice` values

### Price Updates:
- If admin updates variant price **after** reservation is created:
  - Reservation `unitPrice` remains unchanged (frozen at original price)
  - New reservations use the new price
  - Customers pay the locked `unitPrice` they reserved at

### Stock Management:
- Stock decremented **immediately** on reservation creation
- Stock restored **only** when status changed to `CANCELLED` (admin action)
- Expired reservations **do not** restore stock automatically (consider lost)

### Revenue Calculation:
- Dashboard shows sum of `totalAmount` for all `CONFIRMED` reservations
- Analytics breaks down by status

---

## ✅ Complete Pricing Checklist

When testing reservations, verify you can see:

- [ ] **totalAmount** on reservation object (overall cost)
- [ ] **unitPrice** on each item (frozen price)
- [ ] **totalPrice** on each item (quantity × unitPrice)
- [ ] **variant.price** on variant object (current price)
- [ ] **product.name** for admin endpoints (product identification)
- [ ] **customer details** for admin endpoints (who made reservation)

All endpoints now include complete pricing information! 🎉
