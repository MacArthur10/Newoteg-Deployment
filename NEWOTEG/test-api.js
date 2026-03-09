#!/usr/bin/env node

const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('\n🧪 Testing E-Commerce API\n');
  
  try {
    // 1. Register
    console.log('1️⃣ Register customer...');
    const registerRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'john@example.com', password: 'SecurePass123', fullName: 'John Doe', phone: '+1234567890' }
    );
    console.log(`✅ Status: ${registerRes.status}`);
    if (!registerRes.body) throw new Error('Empty response');
    const { accessToken, user } = registerRes.body;
    console.log(`✅ User: ${user.email} (${user.id})`);
    console.log(`✅ Token: ${accessToken.substring(0, 20)}...`);

    // 2. List products
    console.log('\n2️⃣ List products...');
    const productsRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/products',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`✅ Status: ${productsRes.status}`);
    if (!Array.isArray(productsRes.body)) throw new Error('Invalid products response');
    console.log(`✅ Products count: ${productsRes.body.length}`);
    if (productsRes.body.length > 0) {
      console.log(`   - ${productsRes.body[0].name} (${productsRes.body[0].variants.length} variants)`);
    }

    // 3. Get product details
    if (productsRes.body.length > 0) {
      console.log('\n3️⃣ Get product details...');
      const productId = productsRes.body[0].id;
      const detailRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/products/${productId}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ Status: ${detailRes.status}`);
      console.log(`✅ Product: ${detailRes.body.name}`);
      console.log(`✅ Category: ${detailRes.body.category}`);
      console.log(`✅ Variants: ${detailRes.body.variants.length}`);

      // 4. Create reservation
      if (detailRes.body.variants.length > 0) {
        console.log('\n4️⃣ Create reservation...');
        const variantId = detailRes.body.variants[0].id;
        const reservRes = await makeRequest(
          {
            hostname: 'localhost',
            port: 3000,
            path: '/reservations',
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          },
          { items: [{ variantId, quantity: 2 }] }
        );
        console.log(`✅ Status: ${reservRes.status}`);
        console.log(`✅ Reservation ID: ${reservRes.body.id}`);
        console.log(`✅ Status: ${reservRes.body.status}`);
        console.log(`✅ Total: $${reservRes.body.totalAmount}`);

        // 5. Get my reservations
        console.log('\n5️⃣ Get my reservations...');
        const myResRes = await makeRequest(
          {
            hostname: 'localhost',
            port: 3000,
            path: '/reservations/me',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        console.log(`✅ Status: ${myResRes.status}`);
        if (!Array.isArray(myResRes.body)) throw new Error('Invalid reservations response');
        console.log(`✅ Reservations: ${myResRes.body.length}`);
      }
    }

    console.log('\n✨ All tests passed!\n');
  } catch (err) {
    console.error('\n❌ Test error:', err.message);
    console.error(err);
    process.exit(1);
  }
}
