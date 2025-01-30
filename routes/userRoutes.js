const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route (only authenticated users can access)
router.get('/', authMiddleware.authenticate, userController.getAllUsers);

module.exports = router;