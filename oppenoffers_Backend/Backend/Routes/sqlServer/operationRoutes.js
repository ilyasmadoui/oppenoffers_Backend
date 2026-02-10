const express = require('express');
const router = express.Router();
const operationsController = require('../../Controllers/sqlServer/operationController');

router.post('/addOperation', operationsController.insertOperation);
router.get('/AllOperations', operationsController.getAllOperations);
router.delete('/deleteOperation/:NumOperation', operationsController.deleteOperation);
router.patch('/manageArchiveOperation/:id', operationsController.manageArchiveOperation);
router.get('/operationById/:op', operationsController.getOperationById);
router.put('/updateOperation', operationsController.updateOperation);


module.exports = router;
