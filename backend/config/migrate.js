const db = require('./database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        logo_url VARCHAR(500),
        banner_url VARCHAR(500),
        welcome_message VARCHAR(255) DEFAULT 'Seja bem-vindo!',
        service_fee_text VARCHAR(255) DEFAULT 'Taxa de serviço opcional e adicional: 10%.',
        primary_color VARCHAR(7) DEFAULT '#8B6914',
        secondary_color VARCHAR(7) DEFAULT '#000000',
        owner_email VARCHAR(255) UNIQUE NOT NULL,
        owner_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        restaurant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        icon VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        opening_time TIME,
        closing_time TIME,
        available_days VARCHAR(100),
        exclude_holidays BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        category_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        subcategory_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS item_prices (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        item_id INTEGER NOT NULL,
        label VARCHAR(255),
        original_price DECIMAL(10,2),
        price DECIMAL(10,2) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Todas as tabelas foram criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
