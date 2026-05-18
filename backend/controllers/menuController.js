const db = require('../config/database');

const menuController = {
  async getMenu(req, res) {
    try {
      const { slug } = req.params;
      
      // Get restaurant data
      const [restaurants] = await db.execute(
        `SELECT id, name, slug, logo_url, banner_url, banner_mode, welcome_message, welcome_message_en, welcome_message_es,
                service_fee_text, service_fee_text_en, service_fee_text_es, primary_color, secondary_color 
         FROM restaurants WHERE slug = ?`,
        [slug]
      );
      
      if (restaurants.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      
      const restaurant = restaurants[0];
      
      // Get categories with status calculation
      const [categories] = await db.execute(
        `SELECT id, restaurant_id, name, name_en, name_es, description, description_en, description_es,
                icon, sort_order, opening_time, closing_time, available_days, exclude_holidays,
                is_active, created_at
         FROM categories
         WHERE restaurant_id = ? AND is_active = 1
         ORDER BY sort_order, id`,
        [restaurant.id]
      );

      // Get restaurant operating hours
      const [restaurantHours] = await db.execute(
        'SELECT * FROM restaurant_hours WHERE restaurant_id = ? ORDER BY day_of_week, sort_order',
        [restaurant.id]
      );

      // Get all category_day_hours for this restaurant's categories in one query
      const categoryIds = categories.map(c => c.id);
      let allCategoryDayHours = [];
      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map(() => '?').join(',');
        const [cdh] = await db.execute(
          `SELECT * FROM category_day_hours WHERE category_id IN (${placeholders})`,
          categoryIds
        );
        allCategoryDayHours = cdh;
      }

      // Calculate current time/day (UTC-3 offset for Brazil)
      const now = new Date();
      const brazilOffset = -3 * 60;
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const brazilNow = new Date(utcMs + brazilOffset * 60000);
      const currentTime = brazilNow.toTimeString().slice(0, 5);
      const todayDow = brazilNow.getDay(); // 0=Sun, 1=Mon ... 6=Sat
      const currentDayStr = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][todayDow];

      const categoriesWithStatus = categories.map(cat => {
        const dayHours = allCategoryDayHours.filter(h => h.category_id === cat.id);

        let isOpen = true;

        if (dayHours.length > 0) {
          // New per-day logic
          const todayRow = dayHours.find(h => h.day_of_week === todayDow);
          if (!todayRow) {
            isOpen = true; // no restriction for today
          } else if (todayRow.is_closed) {
            isOpen = false;
          } else if (todayRow.open_time && todayRow.close_time) {
            const openT = todayRow.open_time.slice(0, 5);
            const closeT = todayRow.close_time.slice(0, 5);
            isOpen = currentTime >= openT && currentTime <= closeT;
          }
        } else if (cat.opening_time && cat.closing_time) {
          // Legacy fallback
          const openTime = cat.opening_time.slice(0, 5);
          const closeTime = cat.closing_time.slice(0, 5);
          if (currentTime < openTime || currentTime > closeTime) isOpen = false;
          if (cat.available_days && !cat.available_days.includes(currentDayStr)) isOpen = false;
        }

        return { ...cat, isOpen };
      });

      res.json({
        restaurant,
        categories: categoriesWithStatus,
        restaurantHours
      });
      
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({ error: 'Erro ao buscar cardápio' });
    }
  },
  
  async getCategoryItems(req, res) {
    try {
      const { slug, categoryId } = req.params;
      
      // Get restaurant
      const [restaurants] = await db.execute(
        'SELECT id FROM restaurants WHERE slug = ?',
        [slug]
      );
      
      if (restaurants.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      
      const restaurantId = restaurants[0].id;
      
      // Get category
      const [categories] = await db.execute(
        'SELECT * FROM categories WHERE id = ? AND restaurant_id = ?',
        [categoryId, restaurantId]
      );
      
      if (categories.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      
      // Get subcategories
      const [subcategories] = await db.execute(
        `SELECT id, category_id, restaurant_id, name, name_en, name_es, description, description_en, description_es,
                sort_order, is_active, created_at
         FROM subcategories 
         WHERE category_id = ? AND is_active = 1 
         ORDER BY sort_order, id`,
        [categoryId]
      );
      
      // Get items for each subcategory
      const subcategoriesWithItems = await Promise.all(
        subcategories.map(async (subcat) => {
          const [items] = await db.execute(
            `SELECT id, subcategory_id, restaurant_id, name, name_en, name_es, description, description_en, description_es,
                    image_url, has_options, sort_order, is_active, created_at
             FROM items 
             WHERE subcategory_id = ? AND is_active = 1 
             ORDER BY sort_order, id`,
            [subcat.id]
          );
          
          // Get prices for each item
          const itemsWithPrices = await Promise.all(
            items.map(async (item) => {
              const [prices] = await db.execute(
                `SELECT id, item_id, label, label_en, label_es, original_price, price, sort_order
                 FROM item_prices 
                 WHERE item_id = ? 
                 ORDER BY sort_order, id`,
                [item.id]
              );
              return { ...item, prices };
            })
          );
          
          return { ...subcat, items: itemsWithPrices };
        })
      );
      
      res.json({
        category: categories[0],
        subcategories: subcategoriesWithItems
      });
      
    } catch (error) {
      console.error('Get category items error:', error);
      res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  },
  
  async getItem(req, res) {
    try {
      const { slug, itemId } = req.params;
      
      // Get restaurant
      const [restaurants] = await db.execute(
        'SELECT id FROM restaurants WHERE slug = ?',
        [slug]
      );
      
      if (restaurants.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      
      const restaurantId = restaurants[0].id;
      
      // Get item
      const [items] = await db.execute(
        `SELECT id, subcategory_id, restaurant_id, name, name_en, name_es, description, description_en, description_es,
                image_url, sort_order, is_active, created_at
         FROM items WHERE id = ? AND restaurant_id = ?`,
        [itemId, restaurantId]
      );
      
      if (items.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }
      
      const item = items[0];
      
      // Get prices
      const [prices] = await db.execute(
        `SELECT id, item_id, label, label_en, label_es, original_price, price, sort_order
         FROM item_prices WHERE item_id = ? ORDER BY sort_order, id`,
        [itemId]
      );
      
      res.json({ ...item, prices });
      
    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({ error: 'Erro ao buscar item' });
    }
  }
};

module.exports = menuController;