const express = require('express');
const router = express.Router();
const retraitController = require('../../Controllers/sqlServer/retraitController');

router.post('/createRetrait', retraitController.createRetrait);
router.get('/suppliers/:adminId', retraitController.getSuppliersWithOperations);
router.delete('/deleteRetrait', retraitController.deleteRetrait);

module.exports = router;
