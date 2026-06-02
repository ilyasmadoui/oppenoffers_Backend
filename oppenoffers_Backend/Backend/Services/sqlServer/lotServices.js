const {poolPromise , sql} = require('../../Config/dbSqlServer');

module.exports = {
addNewLotSqlServer : async(
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

getAllLotsSqlServer: async (adminID, operationID) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('adminID', sql.UniqueIdentifier, adminID)
            .input('operationID', sql.UniqueIdentifier, operationID)
            .query(`SELECT * FROM dbo.getAllLots(@adminID, @operationID)`);

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
}  
};

