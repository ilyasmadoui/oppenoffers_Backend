const express = require('express');
const router = express.Router();
const budgetController = require('../../Controllers/sqlServer/BudgetController');
const { uploadEngPDF } = require('../../uploadConfig');

router.post('/insertEngagement', budgetController.insertEngagement);
router.get('/selectEngagementsAndPaymentByOperation/:operationId', budgetController.selectEngagementsAndPaymentByOperation);
router.put('/validateEngagement/:id', budgetController.validateEngagement);
router.post('/uploadEngagementPDF/:engagementId', uploadEngPDF.single('pdf'), budgetController.uploadEngagementPDF);

module.exports = router;