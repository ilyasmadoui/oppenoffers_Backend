const { poolPromise, sql } = require("../../Config/dbSqlServer");

module.exports = {

    createRetraitSQL: async (data) => {
        try {
            const { SupplierID, OperationID, NumeroRetrait, adminId, AnnonceID } = data;
            const pool = await poolPromise;

            const result = await pool.request()
                .input("SupplierID", sql.UniqueIdentifier, SupplierID)
                .input("OperationID", sql.UniqueIdentifier, OperationID)
                .input("NumeroRetrait", sql.NVARCHAR(50), NumeroRetrait)
                .input("adminID", sql.UniqueIdentifier, adminId)
                .input("AnnonceID", sql.UniqueIdentifier, AnnonceID)
                .output("ResultCode", sql.Int) // OUTPUT param – SP writes back the result code
                .execute("insertRetrait");

            // Prefer the OUTPUT parameter written by the SP, fall back to RETURN value
            const code = result.output?.ResultCode ?? result.returnValue ?? 5000;
            console.log("[createRetraitSQL] SP result code:", code);
            return { code };

        } catch (error) {
            console.error("Service error (createRetraitSQL):", error);
            return { code: 5000, message: error.message };
        }
    },

    getRetraitsWithSpecsSQL: async (annonceID) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .input('AnnonceID', sql.UniqueIdentifier, annonceID)
                .execute("GetRetraitsWithSpecs");

            return {
                code: 0,
                data: result.recordset
            };

        } catch (error) {
            console.error("Service error (getRetraitsWithSpecsSQL):", error);
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

            console.log("SupplierID", SupplierID)
            console.log("OperationID", OperationID)

            const result = await pool.request()
                .input("SupplierID", sql.UniqueIdentifier, SupplierID)
                .input("OperationID", sql.UniqueIdentifier, OperationID)
                .output("ResultCode", sql.Int)
                .execute("DeleteRetraitBySupplierAndOperation");

            const code = result.output?.ResultCode ?? result.returnValue ?? 5000;
            return { code };

        } catch (error) {
            console.log("SupplierID", SupplierID)
            console.log("OperationID", OperationID)

            console.error("Service error (deleteRetraitSQL):", error);
            return { code: 5000, message: error.message };
        }
    }

};
