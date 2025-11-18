const db = require('../../Config/dbSql');
//const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { v4: uuidv4 } = require("uuid");


const toDateOrNull = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

module.exports = {

    /*addAnnonceSqlServer: async (data) => {
        const {
          Id_Operation,
          Numero,
          Date_Publication,
          Journal,
          Delai,
          Date_Overture,
          adminId,
          Id,
        } = data;
    
        const annonceId = Id || uuidv4();
    
        try {
          const pool = await poolPromise;
    
          const result = await pool
            .request()
            .input("aId_Annonce", sql.UniqueIdentifier, annonceId)
            .input("aId_Operation", sql.UniqueIdentifier, Id_Operation)
            .input("aNumero", sql.NVarChar(255), Numero)
            .input("aDate_Publication", sql.Date, toDateOrNull(Date_Publication))
            .input("aJournal", sql.NVarChar(255), Journal)
            .input("aDelai", sql.Int, Number.isFinite(+Delai) ? parseInt(Delai, 10) : null)
            .input("aDate_Overture", sql.DateTime, toDateOrNull(Date_Overture))
            .input("adminId", sql.UniqueIdentifier, adminId)
            .execute("insertNewANNONCE");
    
          const insertCode = result.returnValue;
    
          if (insertCode === 0 && adminId) {
            await pool
              .request()
              .input("annonceId", sql.UniqueIdentifier, annonceId)
              .input("adminId", sql.UniqueIdentifier, adminId)
              .query(
                "UPDATE dbo.ANNONCES SET adminId = @adminId WHERE Id = @annonceId"
              );
          }
    
          if (insertCode === 0) {
            return {
              success: true,
              code: 0,
              id: annonceId,
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
    
          const annonces = result.recordset || [];
    
          return {
            success: true,
            data: annonces,
            count: annonces.length,
          };
        } catch (error) {
          console.error("Annonce service error (getAllAnnoncesSqlServer):", error);
          return {
            success: false,
            data: [],
            count: 0,
            message: error.message,
          };
        }
      },
    
  deleteAnnonceByIdSqlServer: async (id) => {
    try {
      const pool = await poolPromise;

      // Check: must provide an Id
      const annonceId = id; // Ensure the variable is declared and used

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
        } = data;
    
        try {
          const pool = await poolPromise;
    
          let annonceId = Id;
    
          if (!annonceId && Numero) {
            const lookup = await pool
              .request()
              .input("Numero", sql.VarChar(10), Numero)
              .query("SELECT TOP 1 Id FROM dbo.ANNONCES WHERE Numero = @Numero");
    
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
      },*/

    addAnnonceSQL: async (data) => {
        try {
            const {
                Id_Operation,
                Numero,
                Date_Publication,
                Journal,
                Delai,
                Date_Overture,
                Status,
                adminId
            } = data;

            await db.query(
                'CALL insertNewAnnonceSQL(@resultCode, ?, ?, ?, ?, ?, ?, ?, ?)',
                [Id_Operation, Numero, Date_Publication, Journal, Delai, Date_Overture, Status, adminId]
            );

            const [rows] = await db.query('SELECT @resultCode AS code');
            const resultCode = rows[0]?.code ?? null;

            return { code: resultCode };
        } catch (error) {
            console.error('Service error (addAnnonceSQL):', error);
            throw error;
        }
    },

  getAllAnnoncesSQL: async (adminID) => {
    try {
      const [rows] = await db.query("CALL getAllAnnoncesSQL(?)", [adminID]);

      const annonces = rows[0] || [];

      return {
        success: true,
        data: annonces,
        count: annonces.length,
      };
    } catch (error) {
      console.error("Annonce service error (getAllAnnoncesSQL):", error);
      return {
        success: false,
        data: [],
        count: 0,
        message: error.message,
      };
    }
  },

    deleteAnnonceSQL: async (id) => {
      try {
          await db.query('CALL DeleteAnnonceSQL(?, @resultCode)', [id]);
          const [rows] = await db.query('SELECT @resultCode AS code');
          const resultCode = rows[0]?.code ?? null;
          console.log('Résultat MySQL (deleteAnnonceSQL):', resultCode);
          return { code: resultCode };
      } catch (error) {
          console.error('Service error (deleteAnnonceSQL):', error);
          throw error;
      }
  },

    updateAnnonceSQL: async (data) => {
        try {
            const {
                Numero,
                Date_Publication,
                Journal,
                Delai,
                Date_Overture
            } = data;

            console.log('Mise à jour de l’annonce numéro:', Numero);

            await db.query(
                'CALL updateAnnonceSQL(?, ?, ?, ?, ?, @resultCode)',
                [Numero, Date_Publication, Journal, Delai, Date_Overture]
            );

            const [rows] = await db.query('SELECT @resultCode AS code');
            const resultCode = rows[0]?.code ?? null;

            console.log('Résultat MySQL (updateAnnonceSQL):', resultCode);
            return { code: resultCode };
        } catch (error) {
            console.error('Service error (updateAnnonceSQL):', error);
            throw error;
        }
    }

};
