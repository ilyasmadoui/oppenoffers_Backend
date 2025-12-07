const express = require('express');
const router = express.Router();
const operationController = require('../../Controllers/sql/operationController');

router.post('/addOperation', operationController.addOperation);
router.get('/AllOperations', operationController.getAllOperations);
router.delete('/deleteOperation/:NumOperation', operationController.deleteOperation);

module.exports = router;