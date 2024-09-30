const Router = require('express');

const { createTest, getAnsweredTest, getTotalTest } = require('../controllers/tests.controller');

const router = Router();

router.post('/:category/:stundentId', createTest);
router.get('/:stundentId', getAnsweredTest);
router.get('/', getTotalTest);

module.exports = router;