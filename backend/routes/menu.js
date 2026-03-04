const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Public menu routes (no authentication required)
router.get('/:slug', menuController.getMenu);
router.get('/:slug/category/:categoryId', menuController.getCategoryItems);
router.get('/:slug/item/:itemId', menuController.getItem);

module.exports = router;