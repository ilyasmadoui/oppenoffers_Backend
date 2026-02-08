const express = require('express');
const router = express.Router();
const supplierController = require('../../Controllers/sql/supplierController');

router.post('/addSupplier', supplierController.addSupplier);
router.get('/getAllSuppliers', supplierController.getAllSuppliers);
router.delete('/deleteSupplier/:id', supplierController.deleteSupplier);
router.put('/updateSupplier', supplierController.updateSupplier);

module.exports = router;