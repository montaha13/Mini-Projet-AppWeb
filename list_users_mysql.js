const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smartroombooker'
  });

  try {
    const [rows] = await connection.execute('SELECT id, email, first_name, last_name, role, is_active FROM users');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error occurred:', error.message);
  } finally {
    await connection.end();
  }
}

main();
