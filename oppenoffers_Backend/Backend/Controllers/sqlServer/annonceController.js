const annonceService = require('../../Services/sqlServer/annonceServices');

const { REQUIRED_FIELDS_CREATE } = require("../../Helper");


module.exports = {
  insertAnnonce: async (req, res) => {
    try {
      console.log('Recieved Data :',req.body); 
      
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
  getAllAnnonces: async (req, res) => {
    try {
      const { adminID, operationID } = req.query;

      console.log('getAllAnnonces recieved :', adminID, operationID);
      if (!adminID) {
        return res.status(400).json({
          success: false,
          message: "adminID is required",
          annonces: [],
        });
      }

      if (!operationID) {
        return res.status(400).json({
          success: false,
          message: "operationID is required",
          annonces: [],
        });
      }

      const result = await annonceService.getAllAnnoncesSqlServer(adminID, operationID);

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
  deleteAnnonce: async (req, res) => {
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
  updateAnnonce: async (req, res) => {
    try {
      console.log('Recieved Data :',req.body); 
      const {
        Numero,
        Id,
        Delai,
        Journal,
        Date_Overture,
        Date_Publication,
        Heure_Ouverture,
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
        Heure_Ouverture
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
  },
  validateAnnonce: async (req, res) => {
    try {
      const { annonceId } = req.params;
      if (!annonceId) {
        return res.status(400).json({
          success: false,
          message: "annonceId is required.",
        });
      }

      const result = await annonceService.validateAnnounceService(annonceId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Controller error (validateAnnonce):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },


}