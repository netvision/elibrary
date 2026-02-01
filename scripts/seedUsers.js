const axios = require('axios');

const API_BASE = process.env.API_BASE || 'https://elibraryapi.netserve.in/api/v1';

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@test.elibrary.dev',
    password: 'Admin@123456',
    admissionNumber: 'ADMIN001',
    role: 'admin'
  },
  {
    name: 'Librarian User',
    email: 'librarian@test.elibrary.dev',
    password: 'Lib@123456',
    admissionNumber: 'LIB001',
    role: 'librarian'
  },
  {
    name: 'Teacher User',
    email: 'teacher@test.elibrary.dev',
    password: 'Teacher@123456',
    admissionNumber: 'TCH001',
    role: 'teacher',
    class: 10,
    section: 'A'
  },
  {
    name: 'Student One',
    email: 'student1@test.elibrary.dev',
    password: 'Student@123456',
    admissionNumber: 'STU001',
    role: 'student',
    class: 10,
    section: 'A'
  },
  {
    name: 'Student Two',
    email: 'student2@test.elibrary.dev',
    password: 'Student@123456',
    admissionNumber: 'STU002',
    role: 'student',
    class: 10,
    section: 'B'
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Seeding demo users to', API_BASE);

    for (const user of demoUsers) {
      try {
        const response = await axios.post(`${API_BASE}/auth/register`, user);
        console.log(`✅ Created: ${user.email} (${user.role})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⏭️  Skipped: ${user.email} (already exists)`);
        } else {
          console.error(`❌ Error creating ${user.email}:`);
          if (error.response?.status) {
            console.error(`   Status: ${error.response.status}`);
            if (error.response?.data?.error?.details) {
              console.error(`   Validation Errors:`, JSON.stringify(error.response.data.error.details, null, 2));
            } else if (error.response?.data?.message) {
              console.error(`   Message: ${error.response.data.message}`);
            } else {
              console.error(`   Details:`, JSON.stringify(error.response.data, null, 2));
            }
          } else {
            console.error(`   Error: ${error.message}`);
          }
        }
      }
    }

    console.log('\n✨ Seeding complete!');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

seedUsers();
