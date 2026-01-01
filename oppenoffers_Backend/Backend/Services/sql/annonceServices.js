const db = require('../../Config/dbSql');
const { v4: uuidv4 } = require("uuid");

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
    addAnnonceSQL: async (data) => {
      try {
          const {
              Id_Operation,
              Numero,
              Date_Publication,
              Journal,
              Delai,
              Date_Overture,
              Heure_Ouverture,
              Status,
              adminId
          } = data;

          await db.query(
              'CALL insertNewAnnonceSQL(@resultCode, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [Id_Operation, Numero, Date_Publication, Journal, Delai || 0, Date_Overture, toTimeOrNull(Heure_Ouverture), Status || 1, adminId]
          );

          const [rows] = await db.query('SELECT @resultCode AS code');
          const resultCode = rows[0]?.code ?? 0;

          return { success: resultCode === 0, code: resultCode };

      } catch (error) {
          console.error('Service error (addAnnonceSQL):', error);
          throw error;
      }
    },


  getAllAnnoncesSQL: async (adminID) => {
    try {
      const [rows] = await db.query("CALL getAllAnnoncesSQL(?)", [adminID]);

      const annonces = rows[0] || [];

       const formatted = annonces.map(a => ({
          ...a,
          Heure_Ouverture: a.Heure_Ouverture
            ? a.Heure_Ouverture.substring(0, 5) // "HH:mm"
            : null
        }));

      return {
        success: true,
        data: formatted,
        count: formatted.length,
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
                Date_Overture,
                Heure_Ouverture
            } = data;

            console.log('Mise à jour de l’annonce numéro:', Numero);

            await db.query(
                'CALL updateAnnonceSQL(?, ?, ?, ?, ?, ?, @resultCode)',
                [Numero, Date_Publication, Journal, Delai, Date_Overture, toTimeOrNull(Heure_Ouverture)]
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
