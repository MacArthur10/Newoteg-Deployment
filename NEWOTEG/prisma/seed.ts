import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const storeId = process.env.STORE_ID ?? 'default-store';

  console.log('🌱 Seeding database...');

  // Create admin user
  console.log('\n👤 Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { storeId_email: { storeId, email: 'admin@example.com' } },
    update: {},
    create: {
      storeId,
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      fullName: 'Store Admin',
      phone: '+1234567890',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create sample products with variants
  const products = [
    {
      name: 'Laptop Pro X1',
      description: 'High-performance laptop with 16GB RAM and 512GB SSD',
      category: 'Electronics',
      variants: [
        { sku: 'LAP-X1-SIL', price: 1299.99, stock: 25 },
        { sku: 'LAP-X1-BLK', price: 1299.99, stock: 30 },
      ],
    },
    {
      name: 'Wireless Mouse Pro',
      description: 'Ergonomic wireless mouse with precision tracking',
      category: 'Accessories',
      variants: [
        { sku: 'MOU-PRO-WHT', price: 49.99, stock: 100 },
        { sku: 'MOU-PRO-BLK', price: 49.99, stock: 150 },
      ],
    },
    {
      name: 'Mechanical Keyboard RGB',
      description: 'Premium mechanical keyboard with customizable RGB lighting',
      category: 'Accessories',
      variants: [
        { sku: 'KEY-RGB-BLU', price: 149.99, stock: 50 },
        { sku: 'KEY-RGB-RED', price: 149.99, stock: 45 },
      ],
    },
    {
      name: '4K Monitor Ultra',
      description: '27-inch 4K UHD monitor with HDR support',
      category: 'Electronics',
      variants: [{ sku: 'MON-4K-27', price: 499.99, stock: 20 }],
    },
    {
      name: 'USB-C Hub Pro',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and card reader',
      category: 'Accessories',
      variants: [{ sku: 'HUB-7IN1-GRY', price: 79.99, stock: 75 }],
    },
  ];

  console.log('\n📦 Creating sample products...');
  for (const productData of products) {
    const { variants, ...productInfo } = productData;

    const product = await prisma.product.create({
      data: {
        storeId,
        ...productInfo,
        isActive: true,
        status: 'ACTIVE',
        variants: {
          create: variants.map((variant) => ({
            storeId,
            ...variant,
            isActive: true,
            status: 'ACTIVE',
          })),
        },
      },
      include: { variants: true },
    });

    console.log(`✅ Created product: ${product.name} with ${product.variants.length} variants`);
  }

  console.log('\n✨ Seeding complete!');
  console.log('\n📋 Test credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: Admin@123');
  console.log('   Role: ADMIN');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

