// Quick test to verify admin account exists and password is correct
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdmin() {
  try {
    console.log('🔍 Testing admin account...');
    
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@schulte-tunisia.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    
    // Test password
    const passwordMatch = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('   Password test:', passwordMatch ? '✅ Correct' : '❌ Wrong');
    
    if (passwordMatch) {
      console.log('\n🎉 Admin account is working correctly!');
      console.log('   Email: admin@schulte-tunisia.com');
      console.log('   Password: admin123');
    } else {
      console.log('\n❌ Password mismatch - there might be an issue');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin account:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdmin();