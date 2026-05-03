const db = require('better-sqlite3')('database.db');
try {
  const result = db.prepare('SELECT strftime("%Y-%m", fecha_emision) as mes, COUNT(*) as cantidad FROM certificaciones c JOIN usuarios u ON c.usuario_id = u.id WHERE u.empresa_id = ? GROUP BY mes ORDER BY mes ASC LIMIT 6').all(1);
  console.log(result);
} catch (err) {
  console.error(err);
}
