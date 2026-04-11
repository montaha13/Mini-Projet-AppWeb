const sqlite3 = require('sqlite3').verbose();
const dbPath = '../shared-database/smartroombooker.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  
  db.all("SELECT id, email, password, is_active FROM users WHERE email='sarra.mrabet@esprit.tn'", [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log(rows);
    db.close();
  });
});
