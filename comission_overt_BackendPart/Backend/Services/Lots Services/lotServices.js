const db = require('../../Config/dbSql');
//const {poolPromise , sql} = require('../../Config/dbSqlServer');

module.exports = {
  /*addNewLotSqlServer : async(
    NumeroLot,id_Operation,Designation,adminId
        )=>{
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .input('NumeroLot',sql.NVarChar(255), NumeroLot)
        .input('id_Operation',sql.UniqueIdentifier, id_Operation)
        .input('Designation',sql.NVarChar(255),Designation)
        .input('adminId',sql.UniqueIdentifier, adminId)
        .execute('insertNewLot')

        const insertResult = result.returnValue;

        if(insertResult == 0){
            return { success: true, code: 0, message: 'Lot added successfully.' };
        } else if(insertResult == 1001){
            return { success: false, code: 1001, message: 'Lot already exists.' };
         }else{
            return { success: false, code: 5000, message: 'General error.' };
            }
    } catch (error) {
        console.log("(Lot services error ): ", error);
        return { success: false, code: 5000, message: 'General error occurred.', error: error.message };
    }
},
    getAllLotsSqlServer: async(adminID) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('adminID', sql.UniqueIdentifier, adminID)
            .query(`SELECT * FROM dbo.getAllLots(@adminID)`);

        const lots = result.recordset; 
        return {
            success: true,
            data: lots,
            count: lots.length
        }
    } catch (error) {
        console.log('Get lots service error: ', error);
        return {
            success: false,
            data: error.message, 
            count: 0
        }
    }
},
deleteLotByIdSqlServer: async (id_Lot) => {
  try {
      console.log('🔍 Service deleting lot with ID:', id_Lot);
      
      const pool = await poolPromise;
      const result = await pool.request()
          .input('id_Lot', sql.UniqueIdentifier, id_Lot)
          .execute('dbo.deleteLot');

      const deleteResult = result.returnValue;
      console.log('🔍 Stored procedure return value:', deleteResult);

      if (deleteResult === 0) {
          return {
              success: true,
              message: "Lot deleted successfully"
          };
      } else if (deleteResult === 1005) {
          return {
              success: false,
              message: "Lot not found"
          };
      } else {
          return {
              success: false,
              message: "An error occurred while deleting Lot"
          };
      }
  } catch (error) {
      console.log("Delete Lot Service error:", error);
      return {
          success: false,
          message: "Database error occurred",
          error: error.message
      };
  }
},
updateLotSqlServer: async (id_Lot, lot_Designation) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Lot', sql.UniqueIdentifier, id_Lot)
            .input('lot_Designation', sql.NVarChar(255), lot_Designation)
            .execute('dbo.updateLot');

        const resultValue = result.returnValue;

        if (resultValue === 0) {
            return {
                code: 0,
                success: true,
                message: 'Lot updated successfully'
            };
        } else if (resultValue === 1005) {
            return {
                code: 1005,
                success: false,
                message: 'Lot not found'
            };
        } else {
            return {
                code: resultValue,
                success: false,
                message: 'Failed to update the lot'
            };
        }
    } catch (error) {
        console.error('Service update lot error:', error);
        return {
            code: -1,
            success: false,
            message: 'Database error occurred',
            error: error.message
        };
    }
}*/
  
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
