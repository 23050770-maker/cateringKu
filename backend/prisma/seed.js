const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Seeding tenants...');
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Warung Penyetan Bu Kris',
      description: 'Menyediakan aneka penyetan pedas dan lezat khas Surabaya.',
      address: 'Jl. Dharmawangsa No. 45, Dharmahusada',
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Dapur Sehat Organik',
      description: 'Makanan sehat, salad buah, salad sayur, dan jus segar untuk diet seimbang.',
      address: 'Ruko Green Lake Blok A No. 12, Sukolilo',
    },
  });

  console.log('Seeding users...');
  // Seed a Tenant Owner for Tenant A
  const tenantUser = await prisma.user.create({
    data: {
      firebaseUid: 'mock_tenant_uid_123',
      email: 'tenant@gmail.com',
      name: 'Hendra Owner Bu Kris',
      role: 'TENANT',
      tenantId: tenantA.id,
    },
  });

  // Seed a Customer
  const customerUser = await prisma.user.create({
    data: {
      firebaseUid: 'mock_customer_uid_123',
      email: 'customer@gmail.com',
      name: 'Budi Raharjo',
      role: 'CUSTOMER',
    },
  });

  // Get dynamic dates (today and tomorrow) in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  console.log(`Dates generated: Today = ${today}, Tomorrow = ${tomorrow}`);

  console.log('Seeding menus...');
  // Menus for Tenant A (Warung Penyetan Bu Kris)
  const menuA1 = await prisma.menu.create({
    data: {
      tenantId: tenantA.id,
      name: 'Ayam Goreng Penyet + Nasi',
      description: 'Ayam goreng renyah dengan sambal korek pedas mantap dan nasi hangat.',
      price: 18000,
      maxQuota: 20,
      availableAt: today,
    },
  });

  await prisma.menu.create({
    data: {
      tenantId: tenantA.id,
      name: 'Bebek Bakar Madu',
      description: 'Bebek bakar bumbu madu gurih manis ditambah sambal pencit.',
      price: 25000,
      maxQuota: 10,
      availableAt: today,
    },
  });

  await prisma.menu.create({
    data: {
      tenantId: tenantA.id,
      name: 'Lele Penyet Dobel',
      description: 'Dua ekor lele goreng garing disiram sambal terasi matang.',
      price: 15000,
      maxQuota: 15,
      availableAt: tomorrow,
    },
  });

  // Menus for Tenant B (Dapur Sehat Organik)
  await prisma.menu.create({
    data: {
      tenantId: tenantB.id,
      name: 'Fruit Salad Premium Extra Cheese',
      description: 'Kombinasi buah segar melon, apel, anggur, dan stroberi disiram saus creamy dan keju melimpah.',
      price: 22000,
      maxQuota: 15,
      availableAt: today,
    },
  });

  await prisma.menu.create({
    data: {
      tenantId: tenantB.id,
      name: 'Chicken Caesar Salad',
      description: 'Dada ayam panggang, selada romaine segar, crouton garing, disiram dengan dressing Caesar premium.',
      price: 28000,
      maxQuota: 12,
      availableAt: tomorrow,
    },
  });

  console.log('Seeding a mock paid order for testing...');
  await prisma.order.create({
    data: {
      customerId: customerUser.id,
      tenantId: tenantA.id,
      totalAmount: 18000,
      paymentStatus: 'PAID',
      status: 'PAID',
      orderItems: {
        create: [
          {
            menuId: menuA1.id,
            quantity: 1,
            targetDate: today,
          }
        ]
      }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
