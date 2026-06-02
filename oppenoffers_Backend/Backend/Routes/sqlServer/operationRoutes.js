const express = require('express');
const router = express.Router();
const operationsController = require('../../Controllers/sqlServer/operationController');

router.post('/addOperation', operationsController.insertOperation);
router.get('/AllOperations', operationsController.getAllOperations);
router.delete('/deleteOperation/:operationId', operationsController.deleteOperation);
router.patch('/manageArchiveOperation/:id', operationsController.manageArchiveOperation);
router.get('/operationById/:op', operationsController.getOperationById);
router.put('/updateOperation', operationsController.updateOperation);
router.patch('/validateOperation/:operationId', operationsController.validateOperation);
router.patch('/updateOperationState/:operationId', operationsController.updateOperationState);
router.post("/get-by-date", operationsController.getOperationsByDateController);
router.get("/get-operationBudgetManagement", operationsController.getOperationForBudgetManagementController);
module.exports = router;
