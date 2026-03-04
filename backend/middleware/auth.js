const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - URL:', req.url, 'Method:', req.method);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Token não encontrado');
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.restaurantId = decoded.id;
    req.restaurantEmail = decoded.email;
    
    console.log('✅ Auth OK - RestaurantId:', req.restaurantId);
    next();
  } catch (error) {
    console.log('❌ Auth failed:', error.message);
    res.status(401).json({ error: 'Por favor, faça login para continuar.' });
  }
};

module.exports = authMiddleware;