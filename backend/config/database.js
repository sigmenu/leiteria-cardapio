const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', 'cardapio.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database methods for easier async/await usage
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// MySQL compatibility layer
const promisePool = {
  execute: async (sql, params = []) => {
    // Convert MySQL placeholders to SQLite
    let sqliteQuery = sql.replace(/\?/g, () => '?');
    
    // Handle different query types
    if (sql.toUpperCase().startsWith('SELECT')) {
      const rows = await allQuery(sqliteQuery, params);
      return [rows];
    } else if (sql.toUpperCase().startsWith('INSERT')) {
      const result = await runQuery(sqliteQuery, params);
      return [result];
    } else if (sql.toUpperCase().startsWith('UPDATE') || sql.toUpperCase().startsWith('DELETE')) {
      const result = await runQuery(sqliteQuery, params);
      return [result];
    } else {
      const result = await runQuery(sqliteQuery, params);
      return [result];
    }
  },
  
  query: async (sql, params = []) => {
    return promisePool.execute(sql, params);
  }
};

module.exports = promisePool;