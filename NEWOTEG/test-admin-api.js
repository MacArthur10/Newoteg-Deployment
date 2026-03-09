const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        if (data) {
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Admin API Tests\n');
  let adminToken = null;
  let customerToken = null;

  try {
    // 1. Admin Login
    console.log('1️⃣ Admin Login');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    console.log(`   Status: ${loginRes.status}`);
    if (loginRes.status === 200 || loginRes.status === 201) {
      adminToken = loginRes.body.accessToken;
      console.log(`   ✅ Admin logged in. Token: ${adminToken.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Login failed:`, loginRes.body);
    }

    // 2. Register a customer
    console.log('\n2️⃣ Customer Registration');
    const registerRes = await makeRequest('POST', '/auth/register', {
      email: `customer-${Date.now()}@example.com`,
      password: 'Password123',
      fullName: 'John Doe',
      phone: '1234567890',
    });
    console.log(`   Status: ${registerRes.status}`);
    if (registerRes.status === 201) {
      customerToken = registerRes.body.accessToken;
      console.log(`   ✅ Customer registered. Token: ${customerToken.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Registration failed:`, registerRes.body);
    }

    // 3. Get Admin Dashboard
    console.log('\n3️⃣ Admin Dashboard');
    const dashboardRes = await makeRequest('GET', '/admin/dashboard', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Status: ${dashboardRes.status}`);
    if (dashboardRes.status === 200) {
      console.log(`   ✅ Dashboard data:`);
      console.log(`      - Total Products: ${dashboardRes.body.stats.totalProducts}`);
      console.log(`      - Total Variants: ${dashboardRes.body.stats.totalVariants}`);
      console.log(`      - Total Reservations: ${dashboardRes.body.stats.totalReservations}`);
      console.log(`      - Pending Reservations: ${dashboardRes.body.stats.pendingReservations}`);
      console.log(`      - Confirmed Revenue: $${dashboardRes.body.stats.confirmedRevenue}`);
    } else {
      console.log(`   ❌ Dashboard failed:`, dashboardRes.body);
    }

    // 4. Get Admin Products List
    console.log('\n4️⃣ Admin Products List');
    const adminProductsRes = await makeRequest('GET', '/admin/products', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Status: ${adminProductsRes.status}`);
    if (adminProductsRes.status === 200) {
      console.log(`   ✅ Found ${adminProductsRes.body.length} products`);
      if (adminProductsRes.body.length > 0) {
        const product = adminProductsRes.body[0];
        console.log(`      - First product: ${product.name}`);
        console.log(`      - Variants: ${product.variants?.length || 0}`);
      }
    } else {
      console.log(`   ❌ Admin products failed:`, adminProductsRes.body);
    }

    // 5. Get Admin Users List
    console.log('\n5️⃣ Admin Users List');
    const usersRes = await makeRequest('GET', '/admin/users', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Status: ${usersRes.status}`);
    if (usersRes.status === 200) {
      console.log(`   ✅ Found ${usersRes.body.length} users`);
      usersRes.body.forEach((user, i) => {
        console.log(`      ${i + 1}. ${user.email} (${user.role})`);
      });
    } else {
      console.log(`   ❌ Users list failed:`, usersRes.body);
    }

    // 6. Create a new product (as admin)
    console.log('\n6️⃣ Create Product');
    const createProductRes = await makeRequest('POST', '/products', {
      name: 'Admin Created Product',
      description: 'A product created by admin',
      category: 'Electronics',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Status: ${createProductRes.status}`);
    let newProductId = null;
    if (createProductRes.status === 201) {
      newProductId = createProductRes.body.id;
      console.log(`   ✅ Product created. ID: ${newProductId}`);
    } else {
      console.log(`   ❌ Product creation failed:`, createProductRes.body);
    }

    // 7. Create a variant for the new product
    if (newProductId) {
      console.log('\n7️⃣ Create Product Variant');
      const createVariantRes = await makeRequest('POST', `/products/${newProductId}/variants`, {
        sku: `SKU-${Date.now()}`,
        price: 99.99,
        stock: 50,
      }, {
        Authorization: `Bearer ${adminToken}`,
      });
      console.log(`   Status: ${createVariantRes.status}`);
      if (createVariantRes.status === 201) {
        console.log(`   ✅ Variant created. SKU: ${createVariantRes.body.sku}`);
      } else {
        console.log(`   ❌ Variant creation failed:`, createVariantRes.body);
      }
    }

    // 8. Create a reservation (as customer)
    console.log('\n8️⃣ Create Reservation (Customer)');
    const publicProductsRes = await makeRequest('GET', '/products', null);
    let variantId = null;
    if (publicProductsRes.status === 200 && publicProductsRes.body.length > 0) {
      const variants = publicProductsRes.body[0].variants;
      if (variants && variants.length > 0) {
        variantId = variants[0].id;
      }
    }

    if (variantId) {
      const reservationRes = await makeRequest('POST', '/reservations', {
        items: [{ variantId, quantity: 2 }],
      }, {
        Authorization: `Bearer ${customerToken}`,
      });
      console.log(`   Status: ${reservationRes.status}`);
      let reservationId = null;
      if (reservationRes.status === 201) {
        reservationId = reservationRes.body.id;
        console.log(`   ✅ Reservation created. ID: ${reservationId}`);
        console.log(`      - Status: ${reservationRes.body.status}`);
        console.log(`      - Items: ${reservationRes.body.items?.length || 0}`);

        // 9. Update reservation status (as admin)
        console.log('\n9️⃣ Update Reservation Status (Admin)');
        const updateStatusRes = await makeRequest('PUT', `/reservations/${reservationId}/status`, {
          status: 'CONFIRMED',
        }, {
          Authorization: `Bearer ${adminToken}`,
        });
        console.log(`   Status: ${updateStatusRes.status}`);
        if (updateStatusRes.status === 200) {
          console.log(`   ✅ Reservation status updated to: ${updateStatusRes.body.status}`);
        } else {
          console.log(`   ❌ Status update failed:`, updateStatusRes.body);
        }
      } else {
        console.log(`   ❌ Reservation creation failed:`, reservationRes.body);
      }
    } else {
      console.log('   ⚠️ No variants available to create reservation');
    }

    // 10. Get admin reservations
    console.log('\n🔟 Admin Reservations List');
    const adminReservationsRes = await makeRequest('GET', '/reservations/admin/all', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Status: ${adminReservationsRes.status}`);
    if (adminReservationsRes.status === 200) {
      console.log(`   ✅ Found ${adminReservationsRes.body.length} reservations`);
      adminReservationsRes.body.slice(0, 3).forEach((res, i) => {
        console.log(`      ${i + 1}. ID: ${res.id.substring(0, 8)}... - Status: ${res.status}`);
      });
    } else {
      console.log(`   ❌ Admin reservations failed:`, adminReservationsRes.body);
    }

    // 11. Get revenue analytics
    console.log('\n1️⃣1️⃣ Revenue Analytics');
    const analyticsRes = await makeRequest('GET', '/admin/analytics/revenue', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`   Status: ${analyticsRes.status}`);
    if (analyticsRes.status === 200) {
      console.log(`   ✅ Revenue breakdown by status:`);
      analyticsRes.body.byStatus.forEach((row) => {
        console.log(`      - ${row.status}: count=${row.count}, total=$${row.total}`);
      });
      console.log(`      - Confirmed revenue total: $${analyticsRes.body.totalRevenue}`);
    } else {
      console.log(`   ❌ Analytics failed:`, analyticsRes.body);
    }

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
