const express = require('express');
const router = express.Router();
const lotController = require('../../Controllers/sqlServer/LotsController');

router.post('/addLot', lotController.insertLot);
router.get('/getAllLots', lotController.getAllLots);
router.put('/updateLot/:id', lotController.updateLot);
router.delete('/deleteLot/:id', lotController.deleteLot);

module.exports = router;
