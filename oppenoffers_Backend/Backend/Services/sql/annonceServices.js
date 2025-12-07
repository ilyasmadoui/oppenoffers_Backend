const db = require('../../Config/dbSql');
const { v4: uuidv4 } = require("uuid");

module.exports = {
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
