const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create users
    console.log('👥 Creating users...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@flowforge.com' },
      update: {},
      create: {
        email: 'admin@flowforge.com',
        password: adminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        position: 'System Admin',
        department: 'IT',
        isActive: true,
      },
    });

    console.log(`✅ Created user: ${admin.firstName} ${admin.lastName}`);

    // Create a simple product
    const product = await prisma.product.create({
      data: {
        name: 'Widget A',
        description: 'Sample widget product',
        category: 'ELECTRONICS',
        unitCost: 10.00,
      },
    });

    console.log(`✅ Created product: ${product.name}`);

    // Create a work center
    const workCenter = await prisma.workCenter.create({
      data: {
        name: 'Assembly Station 1',
        type: 'ASSEMBLY',
        location: 'Floor 1',
        status: 'IDLE',
        hourlyCost: 25.00,
      },
    });

    console.log(`✅ Created work center: ${workCenter.name}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@flowforge.com / admin123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
