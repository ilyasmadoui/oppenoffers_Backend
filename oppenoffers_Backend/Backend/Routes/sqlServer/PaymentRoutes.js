const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const paymentController = require('../../Controllers/sqlServer/PaymentController');
const { uploadPaymentPDF } = require('../../uploadConfig');

router.get('/getAllPayments', paymentController.getAllPayments);
router.put('/updatePayment/:paymentId', paymentController.updatePayment);
router.get('/download/:paymentId', paymentController.downloadPDF);
router.post('/uploadPDF/:paymentId', uploadPaymentPDF.single('pdfFile'), paymentController.uploadPDF);

module.exports = router;