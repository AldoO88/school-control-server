const express = require("express");
const { 
  signupController,
  loginController,
  verifyController,
} = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const { Router } = express;

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/verify-token', isAuthenticated, verifyController);

module.exports = router;
