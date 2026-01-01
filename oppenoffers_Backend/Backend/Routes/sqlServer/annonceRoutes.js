const express = require('express');
const router = express.Router();
const annonceController = require('../../Controllers/sqlServer/annonceController');

router.post('/addAnnonce', annonceController.insertAnnonce);
router.get('/AllAnnonces', annonceController.getAllAnnonces);
router.delete('/deleteAnnonce/:id', annonceController.deleteAnnonce);
router.put('/updateAnnonce', annonceController.updateAnnonce);

module.exports = router;
