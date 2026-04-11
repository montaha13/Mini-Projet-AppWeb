const sqlite3 = require('sqlite3').verbose();
const dbPath = '../shared-database/smartroombooker.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  
  db.all("SELECT id, email, first_name, last_name, role, is_active FROM users", [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
});
