const Router = require('express');

const { createStudent, getAllStudents } = require('../controllers/students.controller');

const router = Router();

router.get('/', getAllStudents);
router.post('/register', createStudent);

module.exports = router;