const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const adminController = {
  // Categories CRUD
  async getCategories(req, res) {
    try {
      const [categories] = await db.execute(
        `SELECT * FROM categories 
         WHERE restaurant_id = ? 
         ORDER BY sort_order, id`,
        [req.restaurantId]
      );
      
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  },
  
  async createCategory(req, res) {
    try {
      const { name, description, icon, opening_time, closing_time, available_days, exclude_holidays } = req.body;
      
      const [result] = await db.execute(
        `INSERT INTO categories (restaurant_id, name, description, icon, opening_time, closing_time, available_days, exclude_holidays)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.restaurantId, name, description, icon, opening_time, closing_time, available_days, exclude_holidays || false]
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
      const { name, description, icon, opening_time, closing_time, available_days, exclude_holidays, is_active } = req.body;
      
      await db.execute(
        `UPDATE categories 
         SET name = ?, description = ?, icon = ?, opening_time = ?, closing_time = ?, 
             available_days = ?, exclude_holidays = ?, is_active = ?
         WHERE id = ? AND restaurant_id = ?`,
        [name, description, icon, opening_time, closing_time, available_days, exclude_holidays, is_active, id, req.restaurantId]
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
        
        // Delete old image if exists
        const [items] = await db.execute(
          'SELECT image_url FROM items WHERE id = ? AND restaurant_id = ?',
          [id, req.restaurantId]
        );
        
        if (items[0]?.image_url) {
          const oldImagePath = path.join(__dirname, '..', items[0].image_url);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
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
      
      if (items[0]?.image_url) {
        const imagePath = path.join(__dirname, '..', items[0].image_url);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
      
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