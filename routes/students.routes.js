const Router = require('express');

const { createStudent } = require('../controllers/students.controller');

const router = Router();

router.post('/register', createStudent);

module.exports = router;