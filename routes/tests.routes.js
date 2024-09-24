const Router = require('express');

const { createTest, getAnsweredTest } = require('../controllers/tests.controller');

const router = Router();

router.post('/:category/:stundentId', createTest);
router.get('/:stundentId', getAnsweredTest);

module.exports = router;



