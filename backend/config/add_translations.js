const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'cardapio.db');

async function addTranslationColumns() {
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('Adicionando colunas de tradução...');
      
      // Categories
      db.run(`ALTER TABLE categories ADD COLUMN name_en VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding name_en to categories:', err);
      });
      db.run(`ALTER TABLE categories ADD COLUMN name_es VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding name_es to categories:', err);
      });
      db.run(`ALTER TABLE categories ADD COLUMN description_en VARCHAR(500)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding description_en to categories:', err);
      });
      db.run(`ALTER TABLE categories ADD COLUMN description_es VARCHAR(500)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding description_es to categories:', err);
      });
      
      // Subcategories
      db.run(`ALTER TABLE subcategories ADD COLUMN name_en VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding name_en to subcategories:', err);
      });
      db.run(`ALTER TABLE subcategories ADD COLUMN name_es VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding name_es to subcategories:', err);
      });
      db.run(`ALTER TABLE subcategories ADD COLUMN description_en VARCHAR(500)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding description_en to subcategories:', err);
      });
      db.run(`ALTER TABLE subcategories ADD COLUMN description_es VARCHAR(500)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding description_es to subcategories:', err);
      });
      
      // Items
      db.run(`ALTER TABLE items ADD COLUMN name_en VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding name_en to items:', err);
      });
      db.run(`ALTER TABLE items ADD COLUMN name_es VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding name_es to items:', err);
      });
      db.run(`ALTER TABLE items ADD COLUMN description_en TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding description_en to items:', err);
      });
      db.run(`ALTER TABLE items ADD COLUMN description_es TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding description_es to items:', err);
      });
      
      // Item prices
      db.run(`ALTER TABLE item_prices ADD COLUMN label_en VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding label_en to item_prices:', err);
      });
      db.run(`ALTER TABLE item_prices ADD COLUMN label_es VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding label_es to item_prices:', err);
      });
      
      // Restaurants
      db.run(`ALTER TABLE restaurants ADD COLUMN welcome_message_en VARCHAR(255) DEFAULT 'Welcome!'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding welcome_message_en to restaurants:', err);
      });
      db.run(`ALTER TABLE restaurants ADD COLUMN welcome_message_es VARCHAR(255) DEFAULT '¡Bienvenido!'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding welcome_message_es to restaurants:', err);
      });
      db.run(`ALTER TABLE restaurants ADD COLUMN service_fee_text_en VARCHAR(255) DEFAULT 'Optional service fee: 10%.'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error('Error adding service_fee_text_en to restaurants:', err);
      });
      db.run(`ALTER TABLE restaurants ADD COLUMN service_fee_text_es VARCHAR(255) DEFAULT 'Tasa de servicio opcional: 10%.'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding service_fee_text_es to restaurants:', err);
          reject(err);
        } else {
          console.log('✅ Colunas de tradução adicionadas com sucesso!');
          resolve();
        }
      });
    });
    
    db.close();
  });
}

addTranslationColumns().catch(console.error);