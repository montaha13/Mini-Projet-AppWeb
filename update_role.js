const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'smartroombooker',
      port: 3306
    });
    
    // Update the role to ADMIN
    const [result] = await connection.execute(
      'UPDATE users SET role = "ADMIN" WHERE email = "sarra.mrabet@esprit.tn"'
    );
    
    console.log(`Successfully changed the role for sarra.mrabet@esprit.tn to ADMIN! Rows affected: ${result.affectedRows}`);
    await connection.end();
  } catch (err) {
    console.error('Failed to update role:', err);
  }
}

main();
