const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// Diretório absoluto de uploads — único ponto de verdade para toda deleção de arquivo
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

async function safeDeleteFile(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  // Garante que o arquivo resolvido está DENTRO do diretório uploads (evita path traversal)
  const resolved = path.resolve(UPLOADS_DIR, path.basename(imageUrl));
  if (!resolved.startsWith(UPLOADS_DIR + path.sep) && resolved !== UPLOADS_DIR) return;
  try {
    await fs.unlink(resolved);
  } catch {
    // Arquivo pode já não existir — ignora silenciosamente
  }
}

const adminController = {
  // Categories CRUD
  async getCategories(req, res) {
    try {
      const [categories] = await db.execute(
        `SELECT * FROM categories WHERE restaurant_id = ? ORDER BY sort_order, id`,
        [req.restaurantId]
      );

      if (categories.length === 0) return res.json([]);

      const ids = categories.map(c => c.id);
      const placeholders = ids.map(() => '?').join(',');
      const [allHours] = await db.execute(
        `SELECT * FROM category_day_hours WHERE category_id IN (${placeholders}) ORDER BY day_of_week`,
        ids
      );

      const result = categories.map(c => ({
        ...c,
        day_hours: allHours.filter(h => h.category_id === c.id)
      }));

      res.json(result);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  },
  
  async createCategory(req, res) {
    try {
      const { name, description, icon, exclude_holidays } = req.body;

      const [result] = await db.execute(
        `INSERT INTO categories (restaurant_id, name, description, icon, exclude_holidays)
         VALUES (?, ?, ?, ?, ?)`,
        [req.restaurantId, name, description, icon, exclude_holidays || false]
      );
      
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Categoria criada com sucesso!' 
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  },
  
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, icon, exclude_holidays, is_active } = req.body;

      await db.execute(
        `UPDATE categories
         SET name = ?, description = ?, icon = ?, exclude_holidays = ?, is_active = ?
         WHERE id = ? AND restaurant_id = ?`,
        [name, description, icon, exclude_holidays, is_active, id, req.restaurantId]
      );
      
      res.json({ message: 'Categoria atualizada com sucesso!' });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  },
  
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      await db.execute(
        'DELETE FROM categories WHERE id = ? AND restaurant_id = ?',
        [id, req.restaurantId]
      );
      
      res.json({ message: 'Categoria excluída com sucesso!' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  },
  
  async reorderCategories(req, res) {
    try {
      const { categories } = req.body; // Array of {id, sort_order}
      
      for (const cat of categories) {
        await db.execute(
          'UPDATE categories SET sort_order = ? WHERE id = ? AND restaurant_id = ?',
          [cat.sort_order, cat.id, req.restaurantId]
        );
      }
      
      res.json({ message: 'Ordem atualizada com sucesso!' });
    } catch (error) {
      console.error('Reorder categories error:', error);
      res.status(500).json({ error: 'Erro ao reordenar categorias' });
    }
  },
  
  // Subcategories CRUD
  async getSubcategories(req, res) {
    try {
      const { categoryId } = req.params;
      
      const [subcategories] = await db.execute(
        `SELECT * FROM subcategories 
         WHERE category_id = ? AND restaurant_id = ?
         ORDER BY sort_order, id`,
        [categoryId, req.restaurantId]
      );
      
      res.json(subcategories);
    } catch (error) {
      console.error('Get subcategories error:', error);
      res.status(500).json({ error: 'Erro ao buscar subcategorias' });
    }
  },
  
  async createSubcategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { name, description } = req.body;
      
      const [result] = await db.execute(
        `INSERT INTO subcategories (category_id, restaurant_id, name, description)
         VALUES (?, ?, ?, ?)`,
        [categoryId, req.restaurantId, name, description]
      );
      
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Subcategoria criada com sucesso!' 
      });
    } catch (error) {
      console.error('Create subcategory error:', error);
      res.status(500).json({ error: 'Erro ao criar subcategoria' });
    }
  },
  
  async updateSubcategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;
      
      await db.execute(
        `UPDATE subcategories 
         SET name = ?, description = ?, is_active = ?
         WHERE id = ? AND restaurant_id = ?`,
        [name, description, is_active, id, req.restaurantId]
      );
      
      res.json({ message: 'Subcategoria atualizada com sucesso!' });
    } catch (error) {
      console.error('Update subcategory error:', error);
      res.status(500).json({ error: 'Erro ao atualizar subcategoria' });
    }
  },
  
  async deleteSubcategory(req, res) {
    try {
      const { id } = req.params;
      
      await db.execute(
        'DELETE FROM subcategories WHERE id = ? AND restaurant_id = ?',
        [id, req.restaurantId]
      );
      
      res.json({ message: 'Subcategoria excluída com sucesso!' });
    } catch (error) {
      console.error('Delete subcategory error:', error);
      res.status(500).json({ error: 'Erro ao excluir subcategoria' });
    }
  },
  
  // Items CRUD
  async getItems(req, res) {
    try {
      const { subcategoryId } = req.params;
      
      // Get items first
      const [items] = await db.execute(
        `SELECT * FROM items 
         WHERE subcategory_id = ? AND restaurant_id = ?
         ORDER BY sort_order, id`,
        [subcategoryId, req.restaurantId]
      );
      
      // Get prices for each item
      const itemsWithPrices = await Promise.all(
        items.map(async (item) => {
          const [prices] = await db.execute(
            `SELECT * FROM item_prices 
             WHERE item_id = ? 
             ORDER BY sort_order, id`,
            [item.id]
          );
          return { ...item, prices };
        })
      );
      
      res.json(itemsWithPrices);
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  },
  
  async createItem(req, res) {
    try {
      const { subcategoryId } = req.params;
      const { name, description, prices } = req.body;
      const is_active = req.body.is_active === 'false' ? 0 : 1; // Default to active
      const has_options = req.body.has_options === 'true' ? 1 : 0;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;
      
      // Create item
      const [result] = await db.execute(
        `INSERT INTO items (subcategory_id, restaurant_id, name, description, image_url, is_active, has_options)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [subcategoryId, req.restaurantId, name, description, image_url, is_active, has_options]
      );
      
      const itemId = result.insertId;
      
      // Add prices
      if (prices && prices.length > 0) {
        for (const price of prices) {
          await db.execute(
            `INSERT INTO item_prices (item_id, label, original_price, price, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [itemId, price.label, price.original_price, price.price, price.sort_order || 0]
          );
        }
      }
      
      res.status(201).json({ 
        id: itemId, 
        message: 'Item criado com sucesso!' 
      });
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ error: 'Erro ao criar item' });
    }
  },
  
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name, description, prices } = req.body;
      const is_active = req.body.is_active === 'true' || req.body.is_active === true ? 1 : 0;
      const has_options = req.body.has_options === 'true' ? 1 : 0;
      let image_url = undefined;
      
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
        const [items] = await db.execute(
          'SELECT image_url FROM items WHERE id = ? AND restaurant_id = ?',
          [id, req.restaurantId]
        );
        await safeDeleteFile(items[0]?.image_url);
      }
      
      // Update item
      const updateQuery = image_url 
        ? `UPDATE items SET name = ?, description = ?, image_url = ?, is_active = ?, has_options = ? WHERE id = ? AND restaurant_id = ?`
        : `UPDATE items SET name = ?, description = ?, is_active = ?, has_options = ? WHERE id = ? AND restaurant_id = ?`;
      
      const updateParams = image_url
        ? [name, description, image_url, is_active, has_options, id, req.restaurantId]
        : [name, description, is_active, has_options, id, req.restaurantId];
      
      await db.execute(updateQuery, updateParams);
      
      // Update prices
      if (prices) {
        // Delete old prices
        await db.execute('DELETE FROM item_prices WHERE item_id = ?', [id]);
        
        // Add new prices
        for (const price of prices) {
          await db.execute(
            `INSERT INTO item_prices (item_id, label, original_price, price, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [id, price.label, price.original_price, price.price, price.sort_order || 0]
          );
        }
      }
      
      res.json({ message: 'Item atualizado com sucesso!' });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({ error: 'Erro ao atualizar item' });
    }
  },
  
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      
      // Get item to delete image
      const [items] = await db.execute(
        'SELECT image_url FROM items WHERE id = ? AND restaurant_id = ?',
        [id, req.restaurantId]
      );
      
      await safeDeleteFile(items[0]?.image_url);

      await db.execute(
        'DELETE FROM items WHERE id = ? AND restaurant_id = ?',
        [id, req.restaurantId]
      );
      
      res.json({ message: 'Item excluído com sucesso!' });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({ error: 'Erro ao excluir item' });
    }
  },
  
  // Restaurant settings
  async getSettings(req, res) {
    try {
      console.log('🔍 GET /admin/settings - restaurantId:', req.restaurantId);
      
      const [restaurants] = await db.execute(
        `SELECT id, name, slug, logo_url, banner_url, banner_mode, welcome_message, welcome_message_en, welcome_message_es,
                service_fee_text, service_fee_text_en, service_fee_text_es, primary_color, secondary_color 
         FROM restaurants WHERE id = ?`,
        [req.restaurantId]
      );

      console.log('📦 Query result:', restaurants);

      if (restaurants.length === 0) {
        console.log('❌ Restaurante não encontrado');
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }

      console.log('✅ Enviando dados:', restaurants[0]);
      res.json(restaurants[0]);
    } catch (error) {
      console.error('❌ Get settings error:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  },

  // Restaurant hours
  async getRestaurantHours(req, res) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM restaurant_hours WHERE restaurant_id = ? ORDER BY day_of_week, sort_order',
        [req.restaurantId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Get restaurant hours error:', error);
      res.status(500).json({ error: 'Erro ao buscar horários' });
    }
  },

  async saveRestaurantHours(req, res) {
    try {
      const { hours } = req.body;
      await db.execute('DELETE FROM restaurant_hours WHERE restaurant_id = ?', [req.restaurantId]);
      for (const h of (hours || [])) {
        await db.execute(
          'INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time, is_closed, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [req.restaurantId, h.day_of_week, h.open_time || null, h.close_time || null, h.is_closed ? 1 : 0, h.sort_order || 0]
        );
      }
      res.json({ message: 'Horários salvos com sucesso!' });
    } catch (error) {
      console.error('Save restaurant hours error:', error);
      res.status(500).json({ error: 'Erro ao salvar horários' });
    }
  },

  // Category day hours
  async getCategoryHours(req, res) {
    try {
      const { categoryId } = req.params;
      const [rows] = await db.execute(
        'SELECT * FROM category_day_hours WHERE category_id = ? ORDER BY day_of_week',
        [categoryId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Get category hours error:', error);
      res.status(500).json({ error: 'Erro ao buscar horários da categoria' });
    }
  },

  async saveCategoryHours(req, res) {
    try {
      const { categoryId } = req.params;
      const { hours } = req.body;
      await db.execute('DELETE FROM category_day_hours WHERE category_id = ?', [categoryId]);
      for (const h of (hours || [])) {
        await db.execute(
          'INSERT INTO category_day_hours (category_id, day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)',
          [categoryId, h.day_of_week, h.open_time || null, h.close_time || null, h.is_closed ? 1 : 0]
        );
      }
      res.json({ message: 'Horários da categoria salvos com sucesso!' });
    } catch (error) {
      console.error('Save category hours error:', error);
      res.status(500).json({ error: 'Erro ao salvar horários da categoria' });
    }
  },

  async migrateUploads(req, res) {
    const { password } = req.body;
    if (password !== 't4r5') {
      return res.status(403).json({ error: 'Senha incorreta' });
    }
    const rootUploads = path.resolve(__dirname, '..', '..', 'uploads');
    try {
      let files;
      try { files = await fs.readdir(rootUploads); } catch { files = []; }
      const moved = [], skipped = [];
      for (const file of files) {
        if (file === '.gitkeep') continue;
        const src = path.join(rootUploads, file);
        const dest = path.join(UPLOADS_DIR, file);
        try { await fs.rename(src, dest); moved.push(file); }
        catch { skipped.push(file); }
      }
      res.json({ moved, skipped, total: moved.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateSettings(req, res) {
    try {
      const { 
        name, slug, banner_mode, welcome_message, welcome_message_en, welcome_message_es,
        service_fee_text, service_fee_text_en, service_fee_text_es, primary_color, secondary_color 
      } = req.body;
      let logo_url, banner_url;
      
      if (req.files?.logo) {
        logo_url = `/uploads/${req.files.logo[0].filename}`;
      }
      
      if (req.files?.banner) {
        banner_url = `/uploads/${req.files.banner[0].filename}`;
      }
      
      let updateQuery = `UPDATE restaurants SET name = ?, slug = ?, banner_mode = ?, 
                         welcome_message = ?, welcome_message_en = ?, welcome_message_es = ?,
                         service_fee_text = ?, service_fee_text_en = ?, service_fee_text_es = ?,
                         primary_color = ?, secondary_color = ?`;
      let updateParams = [
        name, slug, banner_mode, 
        welcome_message, welcome_message_en, welcome_message_es,
        service_fee_text, service_fee_text_en, service_fee_text_es,
        primary_color, secondary_color
      ];
      
      if (logo_url) {
        updateQuery += ', logo_url = ?';
        updateParams.push(logo_url);
      }
      
      if (banner_url) {
        updateQuery += ', banner_url = ?';
        updateParams.push(banner_url);
      }
      
      updateQuery += ' WHERE id = ?';
      updateParams.push(req.restaurantId);
      
      await db.execute(updateQuery, updateParams);
      
      res.json({ message: 'Configurações atualizadas com sucesso!' });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  }
};

module.exports = adminController;