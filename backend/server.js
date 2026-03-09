const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || true)
    : 'https://menu.sigback.com:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/admin', require('./routes/admin'));

// In production, serve frontend build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle React routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Run migrations and start server
async function startServer() {
  try {
    const db = require('./config/database');
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
    console.log('✅ Banco de dados pronto');
  } catch (err) {
    console.error('❌ Erro na migration:', err);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Uploads disponíveis em: http://localhost:${PORT}/uploads`);
    console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  });
}

startServer();