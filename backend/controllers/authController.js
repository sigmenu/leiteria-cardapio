const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validationResult } = require('express-validator');

const authController = {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, slug, email, password } = req.body;
      
      // Check if email or slug already exists
      const [existing] = await db.execute(
        'SELECT id FROM restaurants WHERE owner_email = ? OR slug = ?',
        [email, slug]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email ou slug já cadastrado' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create restaurant
      const [result] = await db.execute(
        `INSERT INTO restaurants (name, slug, owner_email, owner_password) 
         VALUES (?, ?, ?, ?)`,
        [name, slug, email, hashedPassword]
      );
      
      // Generate token
      const token = jwt.sign(
        { id: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        message: 'Restaurante cadastrado com sucesso!',
        token,
        restaurant: { id: result.insertId, name, slug, email }
      });
      
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  },
  
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password } = req.body;
      
      // Find restaurant
      const [restaurants] = await db.execute(
        'SELECT * FROM restaurants WHERE owner_email = ?',
        [email]
      );
      
      if (restaurants.length === 0) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }
      
      const restaurant = restaurants[0];
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, restaurant.owner_password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: restaurant.id, email: restaurant.owner_email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Remove password from response
      delete restaurant.owner_password;
      
      res.json({
        message: 'Login realizado com sucesso!',
        token,
        restaurant
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },
  
  async me(req, res) {
    try {
      const [restaurants] = await db.execute(
        'SELECT id, name, slug, logo_url, banner_url, welcome_message, service_fee_text, primary_color, secondary_color, owner_email FROM restaurants WHERE id = ?',
        [req.restaurantId]
      );
      
      if (restaurants.length === 0) {
        return res.status(404).json({ error: 'Restaurante não encontrado' });
      }
      
      res.json({ restaurant: restaurants[0] });
      
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ error: 'Erro ao buscar dados' });
    }
  }
};

module.exports = authController;