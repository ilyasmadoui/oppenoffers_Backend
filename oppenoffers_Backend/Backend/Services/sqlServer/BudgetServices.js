const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { generateIDS, toDateOrNull } = require('../../Helper');

const handleType = (type) => {
    if (type === "DEBIT") {
        return 1;
    }
    return 2;
}

module.exports = {
    insertEngagement: async (data) => {
        const {
            lotId,
            partitionId,
            operationId,
            reference,
            date,
            amount,
            type,
            reason,
            visaCf,
            adminId,
        } = data;

        console.log('RECEIVED DATA :', data);
        const engagementID = generateIDS();

        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("aEngagementID", sql.UniqueIdentifier, engagementID)
                .input("aLot", sql.UniqueIdentifier, lotId)
                .input("aPartitionID", sql.UniqueIdentifier, partitionId || null)
                .input("aOperation", sql.UniqueIdentifier, operationId)
                .input("aReference", sql.NVarChar(255), reference)
                .input("aDate", sql.Date, toDateOrNull(date))
                .input("aAmount", sql.Decimal(18, 2), amount)
                .input("aType", sql.TinyInt, handleType(type))
                .input("aReason", sql.NVarChar(255), reason)
                .input("aVisaCf", sql.NVarChar(255), visaCf)
                .input("adminId", sql.UniqueIdentifier, adminId)
                .execute("insertNewEngagement");

            const insertCode = result.returnValue;

            if (insertCode === 0) {
                return {
                    success: true,
                    engagementID,
                    code: 0,
                    message: "Engagement added successfully.",
                };
            }

            if (insertCode === 1002) {
                return {
                    success: false,
                    code: 1002,
                    message: "Engagement already exists.",
                };
            }

            return {
                success: false,
                code: 5000,
                message: "General error occurred.",
            };
        } catch (error) {
            console.error("Engagement service error (addEngagementSqlServer):", error);
            return {
                success: false,
                code: 5000,
                message: "Database error occurred.",
                error: error.message,
            };
        }
    },

    selectEngagementsAndPaymentByOperation: async (operationId) => {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('OperationID', operationId)
                .execute('GetEngagementAndPaymentByOperation');

            const engagements = result.recordset || [];
            return { success: true, data: engagements };
        } catch (error) {
            console.error("Engagement service error (selectEngagementsByOperationSqlServer):", error);
            return {
                success: false,
                message: "Database error occurred while fetching engagement and payment details.",
                error: error.message,
            };
        }
    },

    validateEngagement: async (engagementId, visaCf, dateVisa, adminId) => {
        try {
            const pool = await poolPromise;
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            const request = new sql.Request(transaction);

            // PARAMETERS
            request.input("engagementID", sql.UniqueIdentifier, engagementId);
            request.input("visaCf", sql.NVarChar(255), visaCf);
            request.input("DateVisaCf", sql.Date, toDateOrNull(dateVisa));
            request.input("CreatedBy", sql.UniqueIdentifier, adminId);

            // UPDATE engagement
            await request.query(`
                UPDATE engagement 
                SET Visa_Cf = @visaCf, Status = 2, DateVisa = @DateVisaCf 
                WHERE EngagementID = @engagementID
            `);

            // INSERT PAYMENT
            await request.query(`
                INSERT INTO PAYMENT (PaymentID, EngagementID, Date, CreatedAt, CreatedBy, Status)
                SELECT NEWID(), e.EngagementID, NULL, GETDATE(), @CreatedBy, 1
                FROM engagement e
                WHERE e.EngagementID = @engagementID
                AND NOT EXISTS (
                    SELECT 1 FROM PAYMENT p WHERE p.EngagementID = e.EngagementID
                )
            `);

            await transaction.commit();

            return { success: true, message: "Engagement validated & Payment created." };
        } catch (error) {
            console.error("validateEngagement error:", error);
            return { success: false, message: "Database error occurred.", error: error.message };
        }
    }
}
