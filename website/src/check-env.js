require('dotenv').config();

console.log('≡ƒôï Environment Variables:');
console.log('  MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('  MYSQL_USER:', process.env.MYSQL_USER);
console.log('  MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***' + process.env.MYSQL_PASSWORD.slice(-4) : 'NOT SET');
console.log('  MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('  MYSQL_PORT:', process.env.MYSQL_PORT);
