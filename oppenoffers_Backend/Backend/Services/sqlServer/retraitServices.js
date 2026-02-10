const { poolPromise, sql } = require("../../Config/dbSqlServer");

module.exports = {

    createRetraitSQL: async (data) => {
        try {
            const { SupplierID, OperationID, NumeroRetrait, adminId } = data;
            const pool = await poolPromise;
            let ResultCode;

            const result = await pool.request()
                .input("SupplierID", sql.UniqueIdentifier, SupplierID)
                .input("OperationID", sql.UniqueIdentifier, OperationID)
                .input("NumeroRetrait", sql.NVARCHAR(50), NumeroRetrait)
                .input("adminID", sql.UniqueIdentifier, adminId)
                .input("ResultCode", sql.Int, ResultCode)
                .execute("insertRetrait");

            const code = result.returnValue ?? 5000;
            return { code };

        } catch (error) {
            console.error("Service error (createRetraitSQL):", error);
            return { code: 5000, message: error.message };
        }
    },

    getSuppliersWithOperationsSQL: async (adminId) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .input("adminId", sql.UniqueIdentifier, adminId)
                .query("SELECT * FROM dbo.getSuppliersWithOperations(@adminId)");

            return {
                code: 0,
                data: result.recordset
            };

        } catch (error) {
            console.error("Service error (getSuppliersWithOperationsSQL):", error);
            return { code: 5000, message: error.message };
        }
    },

    deleteRetraitSQL: async (SupplierID, OperationID) => {
        try {
            const pool = await poolPromise;
            let ResultCode;

            console.log("SupplierID" , SupplierID )
            console.log("OperationID" , OperationID )

            const result = await pool.request()
                .input("SupplierID", sql.UniqueIdentifier, SupplierID)
                .input("OperationID", sql.UniqueIdentifier, OperationID)
                .input("ResultCode", sql.Int, ResultCode)
                .execute("DeleteRetraitBySupplierAndOperation");

            const code = result.returnValue ?? 5000;
            return { code };

        } catch (error) {
            console.log("SupplierID" , SupplierID )
            console.log("OperationID" , OperationID )
            
            console.error("Service error (deleteRetraitSQL):", error);
            return { code: 5000, message: error.message };
        }
    }

};
