const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { v4: uuidv4 } = require("uuid");
const { toDateOrNull, convertTimeToDate } = require('../../Helper');


const validateAnnounce = async (AnnounceId) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('AnnounceId', sql.UniqueIdentifier, AnnounceId)
      .query('UPDATE ANNOUNCES SET Status = 1 WHERE Id = @AnnounceId');
    return { success: true };
  } catch (error) {
    console.error('Error in validateAnnounce:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {

  addAnnonceSqlServer: async (data) => {
    const {
      Id_Operation,
      Numero,
      Date_Publication,
      Journal,
      Delai,
      Date_Overture,
      Heure_Ouverture,
      adminId,
    } = data;

    console.log('RECEIVED DATA :', data);

    // Helper function to convert time string to Date object

    try {
      const pool = await poolPromise;

      const result = await pool
        .request()
        .input("aId_Operation", sql.UniqueIdentifier, Id_Operation)
        .input("aNumero", sql.NVarChar(255), Numero)
        .input("aDate_Publication", sql.Date, toDateOrNull(Date_Publication))
        .input("aJournal", sql.NVarChar(255), Journal)
        .input("aDelai", sql.Int, Number.isFinite(+Delai) ? parseInt(Delai, 10) : null)
        .input("aHeure_Ouverture", sql.Time(7), convertTimeToDate(Heure_Ouverture))
        .input("aDate_Overture", sql.Date, toDateOrNull(Date_Overture))
        .input("adminId", sql.UniqueIdentifier, adminId)
        .execute("insertNewANNONCE");

      const insertCode = result.returnValue;

      if (insertCode === 0) {
        return {
          success: true,
          code: 0,
          message: "Annonce added successfully.",
        };
      }

      if (insertCode === 1002) {
        return {
          success: false,
          code: 1002,
          message: "Annonce already exists.",
        };
      }

      return {
        success: false,
        code: 5000,
        message: "General error occurred.",
      };
    } catch (error) {
      console.error("Annonce service error (addAnnonceSqlServer):", error);
      return {
        success: false,
        code: 5000,
        message: "Database error occurred.",
        error: error.message,
      };
    }
  },

  getAllAnnoncesSqlServer: async (adminID, operationID) => {
    console.log('getAllAnnoncesSqlServer Recieved: ', adminID, "\n", operationID);

    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('adminID', sql.UniqueIdentifier, adminID)
        .input('operationID', sql.UniqueIdentifier, operationID)
        .query('SELECT * FROM dbo.GetAllAnnonce(@adminID, @operationID)');

      const annonces = (result.recordset || []).map(ann => {
        // Helper to format SQL Time object to "HH:mm"
        let formattedTime = ann.Heure_Ouverture;
        if (ann.Heure_Ouverture instanceof Date) {
          const hh = String(ann.Heure_Ouverture.getHours()).padStart(2, '0');
          const mm = String(ann.Heure_Ouverture.getMinutes()).padStart(2, '0');
          formattedTime = `${hh}:${mm}`;
        }

        return {
          ...ann,
          Id: ann.Id?.toString(),
          adminId: ann.adminId?.toString(),
          Heure_Ouverture: formattedTime
        };
      });

      return {
        success: true,
        data: annonces,
        count: annonces.length
      };
    } catch (error) {
      console.error("Error fetching annonces:", error);
      throw error;
    }
  },

  deleteAnnonceByIdSqlServer: async (id) => {
    try {
      const pool = await poolPromise;

      const annonceId = id;

      if (!annonceId) {
        return {
          success: false,
          code: 1004,
          message: "Annonce id is required",
        };
      }

      const deleteResult = await pool
        .request()
        .input("aId_Annonce", sql.UniqueIdentifier, annonceId)
        .execute("dbo.deleteAnnonce");

      const code = deleteResult.returnValue;

      if (code === 0) {
        return {
          success: true,
          code: 0,
          message: "Annonce deleted successfully",
        };
      }

      if (code === 1004) {
        return {
          success: false,
          code: 1004,
          message: "Annonce not found",
        };
      }

      return {
        success: false,
        code: 5000,
        message: "General error occurred while deleting annonce",
      };
    } catch (error) {
      console.error("Annonce service error (deleteAnnonceByIdSqlServer):", error);
      return {
        success: false,
        code: 5000,
        message: "Database error occurred.",
        error: error.message,
      };
    }
  },

  updateAnnonceSqlServer: async (data) => {
    const {
      Id,
      Numero,
      Delai,
      Journal,
      Date_Overture,
      Date_Publication,
      Heure_Ouverture
    } = data;

    try {
      console.log("Service updateAnnounce recieved :", data)
      const pool = await poolPromise;

      const updateResult = await pool
        .request()
        .input("Id", sql.UniqueIdentifier, Id)
        .input("Numero", sql.NVarChar(255), Numero)
        .input("Delai", sql.Int, Number.isFinite(+Delai) ? parseInt(Delai, 10) : null)
        .input("Journal", sql.NVarChar(255), Journal)
        .input("aHeure_Ouverture", sql.Time(7), convertTimeToDate(Heure_Ouverture))
        .input("Date_Overture", sql.Date, toDateOrNull(Date_Overture))
        .input("Date_Publication", sql.Date, toDateOrNull(Date_Publication))
        .execute("dbo.updateAnnonce");

      const code = updateResult.returnValue;

      if (code === 0) {
        return {
          success: true,
          code: 0,
          message: "Annonce updated successfully",
          id: Id,
        };
      }

      if (code === 1005) {
        return {
          success: false,
          code: 1005,
          message: "Annonce not found",
        };
      }

      return {
        success: false,
        code: 5000,
        message: "Failed to update annonce",
      };
    } catch (error) {
      console.error("Annonce service error (updateAnnonceSqlServer):", error);
      return {
        success: false,
        code: 5000,
        message: "Database error occurred.",
        error: error.message,
      };
    }
  },
  validateAnnounceService: async (annonceId) => {
    try {
      const result = await validateAnnounce(annonceId);
      if (result.success) {
        return {
          success: true,
          message: "Annonce validée avec succès."
        };
      } else {
        return {
          success: false,
          message: "Échec de la validation de l'annonce.",
          error: result.error || undefined
        };
      }
    } catch (error) {
      console.error("Error in validateAnnounceService:", error);
      return {
        success: false,
        message: "Une erreur de base de données s'est produite.",
        error: error.message
      };
    }
  }
};