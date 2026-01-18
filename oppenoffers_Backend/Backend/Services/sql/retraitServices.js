const db = require('../../Config/dbSql');

module.exports = {
     createRetraitSQL: async (data) => {
        try {
            const { SupplierID, OperationID, NumeroRetrait, adminId } = data;

            await db.query('CALL insertRetrait(?, ?, ?, ?, @resultCode)', 
                [SupplierID, OperationID, NumeroRetrait, adminId]
            );

            const [rows] = await db.query('SELECT @resultCode AS code');
            const code = rows[0]?.code ?? 5000;

            return { code };
        } catch (error) {
            console.error('Service error (createRetraitSQL):', error);
            return { code: 5000, message: error.message };
        }
    },

    getSuppliersWithOperationsSQL: async (adminId) => {
        try {
            const [rows] = await db.query(
                'CALL GetSuppliersWithOperations(?)',
                [adminId]
            );

            return { code: 0, data: rows[0] };
        } catch (error) {
            console.error('Service error (getSuppliersWithOperationsSQL):', error);
            return { code: 5000, message: error.message };
        }
    },

    deleteRetraitSQL: async (SupplierID, OperationID) => {
        try {
            await db.query(
                'CALL DeleteRetraitBySupplierAndOperation(?, ?, @resultCode)', 
                [SupplierID, OperationID]
            );

            const [rows] = await db.query('SELECT @resultCode AS code');
            const code = rows[0]?.code ?? 5000;

            return { code };
        } catch (error) {
            console.error('Service error (deleteRetraitSQL):', error);
            return { code: 5000, message: error.message };
        }
    }

};