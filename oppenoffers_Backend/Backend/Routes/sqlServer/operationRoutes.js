const express = require('express');
const router = express.Router();
const operationsController = require('../../Controllers/sqlServer/operationController');

router.post('/addOperation', operationsController.insertOperation);
router.get('/AllOperations', operationsController.getAllOperations);
router.delete('/deleteOperation/:NumOperation', operationsController.deleteOperation);

module.exports = router;
