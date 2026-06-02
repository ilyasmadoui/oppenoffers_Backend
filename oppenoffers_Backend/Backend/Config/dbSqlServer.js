const sql = require('mssql');
require('dotenv').config();

console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD );

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolPromise = pool.connect()
  .then(() => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed!', err);
    process.exit(1);
  });

module.exports = { sql, poolPromise };

poolPromise.then(() => {
  console.log('✅ Connection test completed successfully!');
});