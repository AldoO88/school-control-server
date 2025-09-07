const Router = require('express');

const { createTest, getAnsweredTest, getTotalTest } = require('../controllers/tests.controller');

const router = Router();

router.post('/:category/:userId', createTest);
router.get('/:userId', getAnsweredTest);
router.get('/', getTotalTest);

module.exports = router;