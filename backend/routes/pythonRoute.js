const express = require('express');
const router = express.Router();
const { getSentiment, getStockPrediction } = require('../controller/pythonController');

router.post('/getSentiment', getSentiment);
router.post('/predict', getStockPrediction);

module.exports = router;