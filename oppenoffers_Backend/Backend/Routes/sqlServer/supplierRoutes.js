const express = require('express');
const router = express.Router();
const supplierController = require('../../Controllers/sqlServer/supplierController');

router.post('/addSupplier', supplierController.addSupplier);
router.get('/getAllSuppliers', supplierController.getAllFournisseurs);
router.delete('/deleteSupplier/:id', supplierController.deleteFournisseur);
router.put('/updateSupplier', supplierController.updateFournisseur);


module.exports = router;