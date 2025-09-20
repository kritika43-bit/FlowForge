const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('🌱 Creating demo user...');
    
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@flowforge.com' }
    });
    
    if (existingUser) {
      console.log('✅ Demo user already exists');
      return existingUser;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        email: 'admin@flowforge.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        position: 'System Administrator',
        department: 'IT',
        role: 'ADMIN',
        isActive: true,
      }
    });
    
    console.log('✅ Created demo user:', demoUser.email);
    return demoUser;
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser()
  .then(() => {
    console.log('🎉 Demo user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
