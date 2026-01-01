const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERSQL,
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORDSQL || '', 
  database: process.env.DB_NAMESQL,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données :', err.message);
  } else {
    console.log('✅ Connexion réussie à la base de données MySQL !');
    connection.release(); 
  }
});

module.exports = db.promise();
