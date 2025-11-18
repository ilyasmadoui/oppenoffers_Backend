const express = require('express');
const router = express.Router();
const lotController = require('../Controllers/LotsController/LotsController');

router.post('/addLot', lotController.LotSQL);
router.get('/getAllLots', lotController.GetAllLotsSQL);
router.put('/updateLot/:id', lotController.UpdateLotSQL);
router.delete('/deleteLot/:id', lotController.DeleteLotSQL);

/*router.post('/addLot', lotController.insertLotSqlServer);
router.get('/getAllLots', lotController.getAllLotsSqlServer);
router.put('/updateLot/:id', lotController.updateLotSqlServer);
router.delete('/deleteLot/:id', lotController.deleteLotSqlServer);*/

module.exports = router;
