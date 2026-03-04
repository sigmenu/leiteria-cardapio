const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  try {
    // Create demo restaurant
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const [restaurant] = await db.execute(
      `INSERT INTO restaurants (name, slug, owner_email, owner_password, welcome_message)
       VALUES (?, ?, ?, ?, ?)`,
      ['Leiteria 640', 'leiteria-640', 'demo@leiteria.com', hashedPassword, 'Seja bem-vindo!']
    );
    
    const restaurantId = restaurant.insertId;
    
    // Create categories
    const categories = [
      { name: 'Promoções', description: 'Promos vigentes na Leiteria para você curtir!', icon: 'percent', order: 1 },
      { name: 'Cozinha', description: 'Pratos deliciosos preparados com carinho', icon: 'utensils', order: 2, 
        openingTime: '11:30', closingTime: '23:00', days: 'seg,ter,qua,qui,sex,sab,dom' },
      { name: 'Parrilla', description: 'Carnes grelhadas ao ponto perfeito', icon: 'meat', order: 3,
        openingTime: '12:00', closingTime: '23:00', days: 'ter,qua,qui,sex,sab,dom' },
      { name: 'Cafeteria', description: 'Cafés especiais e bebidas quentes', icon: 'coffee', order: 4,
        openingTime: '08:00', closingTime: '22:00', days: 'seg,ter,qua,qui,sex,sab' },
      { name: 'Drinkeria', description: 'Coquetéis autorais e drinks clássicos', icon: 'cocktail', order: 5,
        openingTime: '17:00', closingTime: '01:00', days: 'ter,qua,qui,sex,sab' },
      { name: 'Carta de Vinhos', description: 'Seleção especial de vinhos', icon: 'wine', order: 6 }
    ];
    
    for (const cat of categories) {
      const [category] = await db.execute(
        `INSERT INTO categories (restaurant_id, name, description, icon, sort_order, opening_time, closing_time, available_days)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [restaurantId, cat.name, cat.description, cat.icon, cat.order, 
         cat.openingTime || null, cat.closingTime || null, cat.days || null]
      );
      
      // Add subcategories for Promoções
      if (cat.name === 'Promoções') {
        const [subcat] = await db.execute(
          `INSERT INTO subcategories (category_id, restaurant_id, name, description)
           VALUES (?, ?, ?, ?)`,
          [category.insertId, restaurantId, 'Todo dia uma Promoção', 'De terça a sexta (exceto feriados)']
        );
        
        // Add promo items
        const promoItems = [
          { name: 'TERÇA - Entrecôte 300g', description: 'Serve duas pessoas', order: 1 },
          { name: 'QUARTA - Picanha 400g', description: 'Acompanha fritas e farofa', order: 2 },
          { name: 'QUINTA - Costela Premium', description: 'Defumada por 12 horas', order: 3 },
          { name: 'SEXTA - Combo Burger', description: '2 burgers + batata + bebida', order: 4 }
        ];
        
        for (const item of promoItems) {
          const [itemResult] = await db.execute(
            `INSERT INTO items (subcategory_id, restaurant_id, name, description, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [subcat.insertId, restaurantId, item.name, item.description, item.order]
          );
          
          // Add prices
          await db.execute(
            `INSERT INTO item_prices (item_id, label, original_price, price)
             VALUES (?, ?, ?, ?)`,
            [itemResult.insertId, 'Filé', 198.00, 179.00]
          );
          
          await db.execute(
            `INSERT INTO item_prices (item_id, label, original_price, price)
             VALUES (?, ?, ?, ?)`,
            [itemResult.insertId, 'Frango', 149.00, 139.00]
          );
        }
      }
      
      // Add subcategories for Cozinha
      if (cat.name === 'Cozinha') {
        const [subcat] = await db.execute(
          `INSERT INTO subcategories (category_id, restaurant_id, name)
           VALUES (?, ?, ?)`,
          [category.insertId, restaurantId, 'Pratos Principais']
        );
        
        const mainDishes = [
          { name: 'Risotto de Camarão', description: 'Risotto cremoso com camarões frescos', price: 89.00 },
          { name: 'Filé à Parmegiana', description: 'Acompanha arroz e batata frita', price: 76.00 },
          { name: 'Salmão Grelhado', description: 'Com legumes na manteiga', price: 95.00 }
        ];
        
        for (const dish of mainDishes) {
          const [itemResult] = await db.execute(
            `INSERT INTO items (subcategory_id, restaurant_id, name, description)
             VALUES (?, ?, ?, ?)`,
            [subcat.insertId, restaurantId, dish.name, dish.description]
          );
          
          await db.execute(
            `INSERT INTO item_prices (item_id, price) VALUES (?, ?)`,
            [itemResult.insertId, dish.price]
          );
        }
      }
    }
    
    console.log('✅ Seed executado com sucesso!');
    console.log('📧 Email: demo@leiteria.com');
    console.log('🔑 Senha: demo123');
    console.log('🌐 URL do cardápio: http://localhost:5173/menu/leiteria-640');
    
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    process.exit();
  }
}

seed();