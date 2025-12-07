const express = require('express');
const router = express.Router();
const supplierController = require('../../Controllers/sqlServer/supplierController');

router.post('/addSupplier', supplierController.addSupplier);

module.exports = router;