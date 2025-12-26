const db = require('../../Config/dbSql');

module.exports = {
  addNewLotSQL: async (NumeroLot, id_Operation, Designation, adminId) => {
    try {
        const connection = await db.getConnection();

        await connection.query("SET @resultCode = -1");

        await connection.query(
            "CALL insertNewLotSQL(?, ?, ?, ?, @resultCode)",
            [NumeroLot, id_Operation, Designation, adminId]
        );

        const [out] = await connection.query("SELECT @resultCode AS resultCode");

        const insertResult = out[0].resultCode;

        connection.release();

        if (insertResult === 0) {
            return { success: true, code: 0, message: "Lot added successfully." };
        } else if (insertResult === 1001) {
            return { success: false, code: 1001, message: "Lot already exists." };
        } else {
            return { success: false, code: 5000, message: "General error." };
        }

    } catch (error) {
        console.log("(Lot service MySQL error): ", error);
        return { success: false, code: 5000, message: "General error occurred.", error: error.message };
    }
  },



  getAllLotsSQL: async (adminID) => {
    try {
        const connection = await db.getConnection();

        const [rows] = await connection.query(
            "CALL getAllLotsSQL(?)",
            [adminID]
        );

        connection.release();

        const data = rows[0]; 

        return {
            success: true,
            data: data,
            count: data.length
        };

    } catch (error) {
        console.error('MySQL error in getAllLotsSQL:', error);
        return { success: false, data: [] };
    }
  },


  updateLotSQL: async (data) => {
    const { id, designation } = data;

    try {
      await db.query(
        'CALL updateLotSQL(?, ?, @resultCode)',
        [id, designation]
      );


      const [result] = await db.query('SELECT @resultCode AS code');
      return { code: result[0].code };

    } catch (error) {
      console.error(' Service error (updateLotSQL):', error);
      throw error;
    }
  },

  deleteLotSQL: async (lotId) => {
    try {
      await db.query('CALL deleteLotSQL(?, @resultCode)', [lotId]);

      const [result] = await db.query('SELECT @resultCode AS code');
      const resultCode = result[0]?.code;

      return { code: resultCode };
    } catch (error) {
      console.error("Erreur deleteLotSQL:", error);
      throw error;
    }
  }
};
