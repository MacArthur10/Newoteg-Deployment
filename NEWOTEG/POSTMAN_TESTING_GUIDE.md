# 🧪 Postman Testing Guide - NEWOTEG E-Commerce API

## 📥 Import Collection

1. Open Postman
2. Click **Import** button
3. Select `NEWOTEG-API.postman_collection.json`
4. Collection will appear in your workspace

---

## 🎯 Quick Testing Flow (Recommended Order)

### Step 1: Authenticate as Admin
1. Run **"1. Authentication → Admin Login"**
   - Uses credentials: `admin@example.com` / `Admin@123`
   - ✅ Token automatically saved to collection variables
   - Check the **Console** to see the token

### Step 2: Check Dashboard
2. Run **"4. Admin - Dashboard → Get Dashboard Stats"**
   - Shows total products, variants, reservations
   - Shows confirmed revenue

### Step 3: View Products
3. Run **"2. Public Products → List All Products"**
   - ✅ Automatically saves first product & variant IDs
   - No authentication needed
   - Check response for variant prices and stock

### Step 4: Create Customer & Reserve Products
4. Run **"1. Authentication → Customer Registration"**
   - ✅ Automatically generates unique email with timestamp
   - ✅ Token automatically saved

5. Run **"3. Customer Reservations → Create Reservation"**
   - Uses the variant ID from step 3
   - Check response for pricing details:
     - `totalAmount` - Total reservation cost
     - `expiresAt` - Expiration timestamp (30 min default)
     - `items[].unitPrice` - Price per unit
     - `items[].totalPrice` - Line item total
     - `items[].quantity` - Quantity reserved

6. Run **"3. Customer Reservations → Get My Reservations"**
   - View all your reservations with complete pricing

### Step 5: Admin Manage Reservations
7. Run **"7. Admin - Reservations → Get All Reservations"**
   - View ALL customer reservations
   - **Complete pricing information included:**
     ```json
     {
       "id": "reservation-id",
       "status": "PENDING",
       "totalAmount": "599.98",
       "expiresAt": "2026-03-03T12:30:00.000Z",
       "customer": {
         "email": "customer@test.com",
         "fullName": "Test Customer",
         "phone": "+1234567890"
       },
       "items": [
         {
           "quantity": 2,
           "unitPrice": "299.99",
           "totalPrice": "599.98",
           "variant": {
             "id": "variant-id",
             "sku": "LAPTOP-PRO-X1-I5",
             "price": "299.99",
             "product": {
               "id": "product-id",
               "name": "Laptop Pro X1",
               "category": "Electronics"
             }
           }
         }
       ]
     }
     ```

8. Run **"7. Admin - Reservations → Update Reservation Status"**
   - Change status to `CONFIRMED`, `CANCELLED`, or `EXPIRED`
   - Valid statuses in body:
     ```json
     {"status": "CONFIRMED"}
     {"status": "CANCELLED"}
     {"status": "EXPIRED"}
     ```
   - Stock automatically restored on `CANCELLED`

### Step 6: Product Management (Admin)
9. Run **"5. Admin - Products → Create Product"**
   - ✅ Auto-saves new product ID

10. Run **"6. Admin - Product Variants → Create Variant"**
    - Creates variant for the product from step 9
    - ✅ Auto-saves new variant ID
    - Note: SKU auto-generated if not provided

11. Run **"5. Admin - Products → Update Product"**
    - Modify product details

12. Run **"6. Admin - Product Variants → Update Variant"**
    - Change price, stock, or status

---

## 📊 Reservation Pricing Information

### What You Get in Reservation Responses:

#### ✅ Customer "Create Reservation" Response:
```json
{
  "id": "uuid",
  "storeId": "default-store",
  "customerId": "uuid",
  "status": "PENDING",
  "totalAmount": "599.98",        // ✅ Total reservation amount
  "expiresAt": "2026-03-03T...",  // ✅ Auto-expiry timestamp
  "createdAt": "2026-03-03T...",
  "updatedAt": "2026-03-03T...",
  "items": [
    {
      "id": "uuid",
      "variantId": "uuid",
      "quantity": 2,
      "unitPrice": "299.99",      // ✅ Price per unit at time of reservation
      "totalPrice": "599.98",     // ✅ quantity × unitPrice
      "createdAt": "2026-03-03T..."
    }
  ]
}
```

#### ✅ Customer "Get My Reservations" Response:
```json
[
  {
    "id": "uuid",
    "status": "PENDING",
    "totalAmount": "599.98",      // ✅ Total amount
    "expiresAt": "2026-03-03T...",
    "items": [
      {
        "quantity": 2,
        "unitPrice": "299.99",    // ✅ Unit price
        "totalPrice": "599.98",   // ✅ Total price
        "variant": {
          "id": "uuid",
          "sku": "LAPTOP-PRO-X1-I5",
          "price": "299.99"       // ✅ Current price (may differ from unitPrice)
        }
      }
    ]
  }
]
```

#### ✅ Admin "Get All Reservations" Response:
```json
[
  {
    "id": "uuid",
    "status": "CONFIRMED",
    "totalAmount": "599.98",      // ✅ Total amount
    "expiresAt": "2026-03-03T...",
    "customer": {                 // ✅ Customer details
      "id": "uuid",
      "email": "customer@test.com",
      "fullName": "Test Customer",
      "phone": "+1234567890"
    },
    "items": [
      {
        "quantity": 2,
        "unitPrice": "299.99",    // ✅ Unit price at reservation
        "totalPrice": "599.98",   // ✅ Total price
        "variant": {
          "id": "uuid",
          "sku": "LAPTOP-PRO-X1-I5",
          "price": "299.99",      // ✅ Current price
          "product": {            // ✅ Product details
            "id": "uuid",
            "name": "Laptop Pro X1",
            "category": "Electronics"
          }
        }
      }
    ]
  }
]
```

---

## 🔑 Collection Variables (Auto-Managed)

These are automatically saved as you run requests:

| Variable | Set By | Used By |
|----------|--------|---------|
| `adminToken` | Admin Login | All admin endpoints |
| `customerToken` | Customer Registration/Login | Customer endpoints |
| `productId` | List Products, Create Product | Product operations |
| `variantId` | List Products, Create Variant | Variant operations, reservations |
| `reservationId` | Create Reservation | Update reservation status |

You can view/edit these in:
- **Collection → Variables tab**
- Or manually in request URLs using `{{variableName}}`

---

## 🧩 Common Test Scenarios

### Scenario 1: Complete Customer Purchase Flow
1. Customer Registration
2. List All Products (get variant ID)
3. Create Reservation
4. Get My Reservations (verify details)

### Scenario 2: Admin Order Management
1. Admin Login
2. Get All Reservations
3. Update Reservation Status to CONFIRMED
4. Get Revenue Analytics

### Scenario 3: Product & Inventory Management
1. Admin Login
2. Create Product
3. Create Variant with price & stock
4. Update Variant (change price/stock)
5. Get All Products (Admin) - verify changes

### Scenario 4: Stock Depletion Test
1. List Products (note variant stock)
2. Customer Registration
3. Create Reservation (quantity = available stock)
4. List Products again (stock should be reduced)
5. Try creating another reservation (should fail if stock = 0)

### Scenario 5: Cancellation & Stock Restoration
1. Create Reservation
2. Note the stock level
3. Admin: Update Reservation Status to CANCELLED
4. List Products (stock should be restored)

---

## ⚠️ Important Notes

### Reservation Expiration
- Default expiry: **30 minutes** (configurable in `.env`)
- Expired reservations automatically restore stock
- Status changes to `EXPIRED` after expiry time

### Stock Management
- Stock is **atomically decremented** on reservation creation
- **Transactional safety** ensures no overselling
- Stock restored only on `CANCELLED` status (not `EXPIRED`)

### Price Locking
- Prices are locked at reservation time (`unitPrice`)
- If product price changes later, reservation keeps original price
- Admin can see both `unitPrice` (locked) and current `variant.price`

### Authentication
- Admin endpoints require `Authorization: Bearer {{adminToken}}`
- Customer endpoints require `Authorization: Bearer {{customerToken}}`
- Public endpoints (list/view products) need no authentication

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Run the login request again (Admin or Customer)
- Check that token is saved in collection variables
- Verify token is being sent in Authorization header

### "Product not found" / "Variant not found"
- Run "List All Products" first to populate IDs
- Check collection variables have correct IDs

### "Insufficient stock"
- Check product variant stock level
- Try reducing quantity in reservation request
- Or create more variants with stock

### "Invalid token payload"
- JWT token expired (default: 1 day)
- Re-login to get new token

---

## 📈 Response Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | GET/PUT requests succeeded |
| 201 | Created | POST requests (register, create) |
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not admin (for admin endpoints) |
| 404 | Not Found | Invalid ID in URL |
| 500 | Server Error | Check server logs |

---

## 🎯 Testing Checklist

### Authentication ✅
- [ ] Admin login successful
- [ ] Customer registration successful
- [ ] Customer login successful
- [ ] Tokens automatically saved

### Public Endpoints ✅
- [ ] List all products (no auth)
- [ ] Get product details (no auth)
- [ ] Products include variants
- [ ] Variant prices visible

### Customer Reservations ✅
- [ ] Create reservation with correct pricing
- [ ] `unitPrice` and `totalPrice` included
- [ ] `totalAmount` calculated correctly
- [ ] `expiresAt` set to 30 min from now
- [ ] Get my reservations shows all data
- [ ] Stock decremented after reservation

### Admin Dashboard ✅
- [ ] Dashboard stats accurate
- [ ] Revenue analytics by status
- [ ] All counts correct

### Admin Products ✅
- [ ] Create product successful
- [ ] Update product successful
- [ ] Delete product (soft delete)
- [ ] Create variant successful
- [ ] Update variant (price/stock)
- [ ] Delete variant

### Admin Reservations ✅
- [ ] Get all reservations with customer info
- [ ] Complete pricing details visible
- [ ] Product name and category included
- [ ] Update status to CONFIRMED works
- [ ] Update status to CANCELLED restores stock
- [ ] All reservation items show unitPrice + totalPrice

---

## 💡 Pro Tips

1. **Use the Console**: Open Postman Console (View → Show Postman Console) to see auto-saved variables
2. **Test Scripts**: Each request has test scripts that auto-save IDs - check the Tests tab
3. **Environment**: Create a Postman Environment for different servers (dev/staging/prod)
4. **Duplicate Requests**: Right-click any request → Duplicate to create test variations
5. **Export Results**: Use Postman Runner to run entire collection and export results

---

**Happy Testing! 🚀**

If you encounter any issues, check:
1. Server is running: `npm run start:dev`
2. Database is connected (check server logs)
3. Admin user exists: `npm run seed`
