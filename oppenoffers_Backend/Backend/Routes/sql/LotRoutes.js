const express = require('express');
const router = express.Router();
const lotController = require('../../Controllers/sql/LotsController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/addLot', authMiddleware, lotController.addLot);
router.get('/getAllLots', authMiddleware, lotController.getAllLots);
router.put('/updateLot/:id', authMiddleware, lotController.updateLot);
router.delete('/deleteLot/:id', authMiddleware, lotController.deleteLot);

module.exports = router;