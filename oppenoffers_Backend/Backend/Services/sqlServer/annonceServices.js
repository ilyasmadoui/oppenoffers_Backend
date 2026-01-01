const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { v4: uuidv4 } = require("uuid");


const toDateOrNull = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
const toTimeOrNull = (value) => {
    if (!value) return null;
    const [hours, minutes] = value.split(':');
    if (hours === undefined || minutes === undefined) {
      return null;
    }
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
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

  console.log('RECIVED DATA :', data);
  
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("aId_Operation", sql.UniqueIdentifier, Id_Operation)
      .input("aNumero", sql.NVarChar(255), Numero)
      .input("aDate_Publication", sql.Date, toDateOrNull(Date_Publication))
      .input("aJournal", sql.NVarChar(255), Journal)
      .input("aDelai", sql.Int, Number.isFinite(+Delai) ? parseInt(Delai, 10) : null)
      .input("aHeure_Ouverture", sql.Time(7), toTimeOrNull(Heure_Ouverture))
      .input("aDate_Overture", sql.DateTime, toDateOrNull(Date_Overture))
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
    
getAllAnnoncesSqlServer: async (adminID) => {
  try {
    const pool = await poolPromise; 
    const result = await pool
      .request()
      .input("adminID", sql.UniqueIdentifier, adminID)
      .query("SELECT * FROM dbo.GetAllAnnonce(@adminID)"); 

    const annonces = (result.recordset || []).map(ann => {
      // Helper to format SQL Time object to "HH:mm"
      let formattedTime = ann.Heure_Ouverture;
      if (ann.Heure_Ouverture instanceof Date) {
        formattedTime = ann.Heure_Ouverture.toISOString().substring(11, 16);
      }

      return {
        ...ann,
        // Ensure the ID and adminId are treated as strings to prevent index issues
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
          const pool = await poolPromise;
    
          let annonceId = Id;
    
          if (!annonceId && Numero) {
            const lookup = await pool
              .request()
              .input("Numero", sql.VarChar(10), Numero)
              .query("SELECT TOP 1 Id FROM dbo.ANNOUNCES WHERE Numero = @Numero");
    
            if (lookup.recordset.length) {
              annonceId = lookup.recordset[0].Id;
            }
          }
    
          if (!annonceId) {
            return {
              success: false,
              code: 1005,
              message: "Annonce not found",
            };
          }
    
          const updateResult = await pool
            .request()
            .input("Id", sql.UniqueIdentifier, annonceId)
            .input("Delai", sql.Int, Number.isFinite(+Delai) ? parseInt(Delai, 10) : null)
            .input("Journal", sql.NVarChar(255), Journal)
            .input("aHeure_Ouverture", sql.Time(7), toTimeOrNull(Heure_Ouverture))
            .input("Date_Overture", sql.Date, toDateOrNull(Date_Overture))
            .input("Date_Publication", sql.Date, toDateOrNull(Date_Publication))
            .execute("dbo.updateAnnonce");
    
          const code = updateResult.returnValue;
    
          if (code === 0) {
            return {
              success: true,
              code: 0,
              message: "Annonce updated successfully",
              id: annonceId,
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
      }
};
