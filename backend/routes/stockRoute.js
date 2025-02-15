const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { getStock, buyStock, sellStock, myStock } = require('../controller/stockController');

router.get("/getStock/:symbol",getStock);
router.post('/buyStock',verifyToken,buyStock);
router.post('/sellStock',verifyToken,sellStock);
router.get('/myStock',verifyToken, myStock);

module.exports = router;