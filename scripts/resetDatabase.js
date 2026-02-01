require('dotenv').config();
const mongoose = require('mongoose');

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the database
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped successfully');

    await mongoose.connection.close();
    console.log('✅ Connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetDatabase();
