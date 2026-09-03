const Router = require('express');

const { createAnswer, getAnsweredTest, getTotalTest, getStudentsByGroupAndCategory, getStudentsByGrade } = require('../controllers/answers.controller');

const router = Router();

router.post('/:category/:userId', createAnswer);
router.get('/:userId', getAnsweredTest);
router.get("/students/group-category", getStudentsByGroupAndCategory);
router.get("/students/grade-results", getStudentsByGrade);

module.exports = router;



