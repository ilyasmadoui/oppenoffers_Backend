const annonceService = require("../../Services/sql/annonceServices");

const { REQUIRED_FIELDS_CREATE } = require("../../Helper");


module.exports = {
  addAnnonce: async (req, res) => {
        try {
            const data = req.body;
            const result = await annonceService.addAnnonceSQL(data);

            res.status(200).json({
                success: true,
                annonce: { code: result.code }
            });
        } catch (error) {
            console.error('Controller error (Annonce):', error);
            res.status(500).json({ success: false, message: error.message });
        }
  },
  getAllAnnonces: async (req, res) => {
    try {
      const { adminID } = req.query;

      if (!adminID) {
        return res.status(400).json({
          success: false,
          message: "adminID est requis",
          annonces: [],
        });
      }

      const result = await annonceService.getAllAnnoncesSQL(adminID);

      if (result.success) {
        return res.status(200).json({
          success: true,
          annonces: result.data,
          count: result.count,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Impossible de récupérer les annonces",
        annonces: [],
        error: result.message,
      });

    } catch (error) {
      console.error("Controller error (AllAnnoncesSQL):", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur interne",
        annonces: [],
        error: error.message,
      });
    }
  },
  removeAnnonce: async (req, res) => {
      try {
          const { id } = req.params;
          console.log('Requête suppression annonce Id :', id);

          if (!id) {
              return res.status(400).json({
                  success: false,
                  message: 'id de l’annonce requis',
                  code: 4001
              });
          }

          const result = await annonceService.deleteAnnonceSQL(id);

          if (result.code === 0) {
              res.status(200).json({
                  success: true,
                  message: `Annonce ${id} supprimée avec succès.`,
                  code: result.code
              });
          } else if (result.code === 1003) {
              res.status(404).json({
                  success: false,
                  message: `Annonce ${id} introuvable ou déjà supprimée.`,
                  code: result.code
              });
          } else {
              res.status(500).json({
                  success: false,
                  message: `Erreur MySQL (code ${result.code})`,
                  code: result.code
              });
          }

      } catch (error) {
          console.error('Controller error (removeAnnonceSQL):', error);
          res.status(500).json({
              success: false,
              message: 'Erreur serveur: ' + error.message,
              code: 5000
          });
      }
  },
  updateAnnonce: async (req, res) => {
      try {
          const data = req.body;
          console.log('Requête mise à jour annonce:', data);

          const result = await annonceService.updateAnnonceSQL(data);

          if (result.code === 0) {
              res.status(200).json({
                  success: true,
                  message: `Annonce ${data.Numero} mise à jour avec succès.`,
              });
          } else if (result.code === 1003) {
              res.status(404).json({
                  success: false,
                  message: `Annonce ${data.Numero} introuvable.`,
              });
          } else {
              res.status(500).json({
                  success: false,
                  message: `Erreur MySQL (code ${result.code})`,
              });
          }

      } catch (error) {
          console.error('Controller error (updateAnnonceSQL):', error);
          res.status(500).json({
              success: false,
              message: 'Erreur serveur: ' + error.message,
          });
      }
  }
};
