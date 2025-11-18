const annonceService = require("../../Services/Annonces Services/annonceServices");

const REQUIRED_FIELDS_CREATE = [
  "Id_Operation",
  "Numero",
  "Date_Publication",
  "Journal",
  "Delai",
  "Date_Overture",
  "adminId",
];

module.exports = {
  /*insertAnnonceSqlServer: async (req, res) => {
    try {
      const missing = REQUIRED_FIELDS_CREATE.filter((field) => !req.body?.[field]);

      if (missing.length) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      const result = await annonceService.addAnnonceSqlServer(req.body);

      if (result.success) {
        return res.status(201).json({
          success: true,
          code: result.code,
          id: result.id,
          message: result.message,
        });
      }

      const status = result.code === 1002 ? 409 : 500;
      return res.status(status).json({
        success: false,
        code: result.code,
        message: result.message,
        error: result.error,
      });
    } catch (error) {
      console.error("Controller error (insertAnnonceSqlServer):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getAllAnnoncesSqlServer: async (req, res) => {
    try {
      const { adminID } = req.query;

      if (!adminID) {
        return res.status(400).json({
          success: false,
          message: "adminID is required",
          annonces: [],
        });
      }

      const result = await annonceService.getAllAnnoncesSqlServer(adminID);

      if (result.success) {
        return res.status(200).json({
          success: true,
          annonces: result.data,
          count: result.count,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve annonces",
        annonces: [],
        error: result.message,
      });
    } catch (error) {
      console.error("Controller error (getAllAnnoncesSqlServer):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        annonces: [],
        error: error.message,
      });
    }
  },

  deleteAnnonceSqlServer: async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Annonce id is required",
        });
      }
  
      const result = await annonceService.deleteAnnonceByIdSqlServer(id);
  
      if (result.success) {
        return res.status(200).json({
          success: true,
          code: result.code,
          message: result.message,
        });
      }
  
      const status = result.code === 1004 ? 404 : 500;
  
      return res.status(status).json({
        success: false,
        code: result.code,
        message: result.message,
        error: result.error,
      });
    } catch (error) {
      console.error("Controller error (deleteAnnonceSqlServer):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateAnnonceSqlServer: async (req, res) => {
    try {
      const {
        Numero,
        Id,
        Delai,
        Journal,
        Date_Overture,
        Date_Publication,
      } = req.body || {};

      if (!Numero && !Id) {
        return res.status(400).json({
          success: false,
          message: "Numero or Id is required to update annonce",
        });
      }

      const result = await annonceService.updateAnnonceSqlServer({
        Numero,
        Id,
        Delai,
        Journal,
        Date_Overture,
        Date_Publication,
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          code: result.code,
          message: result.message,
          id: result.id,
        });
      }

      const status =
        result.code === 1005
          ? 404
          : 500;

      return res.status(status).json({
        success: false,
        code: result.code,
        message: result.message,
        error: result.error,
      });
    } catch (error) {
      console.error("Controller error (updateAnnonceSqlServer):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
          });
      }
  }*/

   AnnonceSQL: async (req, res) => {
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


  AllAnnoncesSQL: async (req, res) => {
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

  removeAnnonceSQL: async (req, res) => {
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

  upAnnonceSQL: async (req, res) => {
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
