// Test Guest Reservation Endpoint
const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:4000/api';

async function testGuestReservation() {
  try {
    // First, authenticate as admin to create a test product
    console.log('1. Authenticating admin...');
    const loginResp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@newoteg.com',
        password: 'Admin123456'
      })
    });
    
    if (!loginResp.ok) {
      throw new Error(`Auth failed: ${loginResp.status}`);
    }
    
    const loginData = await loginResp.json();
    const token = loginData.accessToken;
    console.log('✓ Admin authenticated');
    
    // Create a test product with variant
    console.log('\n2. Creating test product...');
    const ts = Date.now();
    const prodResp = await fetch(`${API_BASE}/products/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: `TestProd${ts}`,
        description: 'Test product for reservation',
        brand: 'TEST',
        imageUrl: 'https://via.placeholder.com/300',
        categoryName: 'General',
        sku: `SKU${ts}`,
        purchasePrice: 1000,
        salePrice: 2500,
        stock: 10
      })
    });
    
    if (!prodResp.ok) {
      const err = await prodResp.text();
      throw new Error(`Product creation failed: ${prodResp.status} - ${err}`);
    }
    
    const prodData = await prodResp.json();
    const variantId = prodData.variants[0]?.id;
    console.log(`✓ Product created with variant: ${variantId}`);
    
    // Test guest reservation with created variant
    console.log('\n3. Testing guest reservation...');
    console.log('   Sending request to:', `${API_BASE}/reservations/guest`);
    console.log('   Variant ID:', variantId);
    
    const resResp = await Promise.race([
      fetch(`${API_BASE}/reservations/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: 'Test Guest',
            email: `guest${ts}@test.com`,
            phone: '0123456789',
            address: '123 Test Street'
          },
          items: [
            {
              variantId: variantId,
              quantity: 2
            }
          ]
        })
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout after 5s')), 5000))
    ]);
    
    console.log('   Response status:', resResp.status);
    
    if (!resResp.ok) {
      let err;
      try {
        err = await resResp.json();
      } catch {
        err = { text: await resResp.text() };
      }
      console.error(`✗ Reservation failed: ${resResp.status}`);
      console.error('Error details:', JSON.stringify(err, null, 2));
      process.exit(1);
    }
    
    const resData = await resResp.json();
    console.log('✓ Guest reservation created successfully!');
    console.log('\nReservation details:');
    console.log(`  ID: ${resData.id}`);
    console.log(`  Customer: ${resData.customer?.fullName || 'N/A'}`);
    console.log(`  Email: ${resData.customer?.email}`);
    console.log(`  Items: ${resData.items?.length || 0}`);
    console.log(`  Status: ${resData.status}`);
    console.log('\n✅ All tests passed!');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testGuestReservation();
