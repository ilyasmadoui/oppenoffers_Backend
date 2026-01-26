const express = require('express');
const router = express.Router();
const annonceController = require('../../Controllers/sql/annonceController');

router.post('/addAnnonce', annonceController.addAnnonce);
router.get('/AllAnnonces', annonceController.getAllAnnonces);
router.delete('/deleteAnnonce/:id', annonceController.removeAnnonce);
router.put('/updateAnnonce', annonceController.updateAnnonce);

module.exports = router;