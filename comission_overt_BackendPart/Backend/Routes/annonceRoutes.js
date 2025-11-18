const express = require('express');
const router = express.Router();
const annonceController = require('../Controllers/annoncesController/annonceController');

router.post('/addAnnonce', annonceController.AnnonceSQL);
router.get('/AllAnnonces', annonceController.AllAnnoncesSQL);
router.delete('/deleteAnnonce/:id', annonceController.removeAnnonceSQL);
router.put('/updateAnnonce', annonceController.upAnnonceSQL);

/*router.post('/addAnnonce', annonceController.insertAnnonceSqlServer);
router.get('/AllAnnonces', annonceController.getAllAnnoncesSqlServer);
router.delete('/deleteAnnonce/:id', annonceController.deleteAnnonceSqlServer);
router.put('/updateAnnonce', annonceController.updateAnnonceSqlServer);*/

module.exports = router;
