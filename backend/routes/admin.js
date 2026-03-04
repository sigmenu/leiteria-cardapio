const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// All admin routes require authentication
router.use(authMiddleware);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.put('/categories/reorder', adminController.reorderCategories);

// Subcategories
router.get('/categories/:categoryId/subcategories', adminController.getSubcategories);
router.post('/categories/:categoryId/subcategories', adminController.createSubcategory);
router.put('/subcategories/:id', adminController.updateSubcategory);
router.delete('/subcategories/:id', adminController.deleteSubcategory);

// Items
router.get('/subcategories/:subcategoryId/items', adminController.getItems);
router.post('/subcategories/:subcategoryId/items', 
  upload.single('image'), 
  (req, res, next) => {
    // Parse prices from string to JSON
    if (req.body.prices && typeof req.body.prices === 'string') {
      try {
        req.body.prices = JSON.parse(req.body.prices);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid prices format' });
      }
    }
    next();
  },
  adminController.createItem
);
router.put('/items/:id', 
  upload.single('image'),
  (req, res, next) => {
    // Parse prices from string to JSON
    if (req.body.prices && typeof req.body.prices === 'string') {
      try {
        req.body.prices = JSON.parse(req.body.prices);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid prices format' });
      }
    }
    next();
  },
  adminController.updateItem
);
router.delete('/items/:id', adminController.deleteItem);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', 
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  adminController.updateSettings
);

module.exports = router;