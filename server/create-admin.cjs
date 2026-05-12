const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Create a regular user first
    const user = await prisma.user.create({
      data: {
        email: 'admin@pbiacademy.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin',
        avatar: '/admin-avatar.jpg',
        loyaltyTier: 'DIAMOND',
        points: 10000,
        streak: 30,
        level: 10
      }
    });

    // Create admin user record
    const adminUser = await prisma.adminUser.create({
      data: {
        userId: user.id,
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify(['dashboard', 'users', 'content', 'analytics', 'settings', 'security'])
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@pbiacademy.com');
    console.log('Password: admin123');
    console.log('User ID:', user.id);
    console.log('Admin ID:', adminUser.id);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
