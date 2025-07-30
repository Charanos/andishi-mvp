require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const url = process.env.DATABASE_URL;
if (url) {
  const dbName = url.split('/').pop().split('?')[0];
  console.log('Database name:', dbName);
  
  if (dbName === 'test') {
    console.log('✅ Using test database (development)');
  } else {
    console.log('⚠️  Using production database');
  }
} else {
  console.log('❌ No DATABASE_URL found');
}
