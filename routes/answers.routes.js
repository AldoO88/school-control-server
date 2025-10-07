const Router = require('express');

const { createAnswer, getAnsweredTest, getTotalTest, getStudentsByGroupAndCategory } = require('../controllers/answers.controller');

const router = Router();

router.post('/:category/:userId', createAnswer);
router.get('/:userId', getAnsweredTest);
router.post("/students/group-category", getStudentsByGroupAndCategory);

module.exports = router;



