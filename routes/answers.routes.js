const Router = require('express');

const { createAnswer, getAnsweredTest, getTotalTest } = require('../controllers/answers.controller');

const router = Router();

router.post('/:category/:userId', createAnswer);
router.get('/:userId', getAnsweredTest);

module.exports = router;



