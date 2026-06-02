const { poolPromise, sql } = require('../../Config/dbSqlServer.js');
const { generateIDS, toDateTimeOrNull } = require('../../Helper');
const { sendEmailToMultiple } = require("../../utils/sendEmail.js");
const { generateEvaluationEmailHTML } = require('../../utils/emailTemplates/evaluationEmailTemplate.js');


const insertEvaluation = async (
    IdSession,
    IdOperation,
    IdLot,
    IdSupplier,
    ScoreTechnique,
    ScoreFinancier,
    ScoreAdministrative,
    FinalNote,
    RejectionReason
) => {
    try {
        console.log("Insert evaluation received:", {
            IdSession,
            IdOperation,
            IdLot,
            IdSupplier,
            ScoreTechnique,
            ScoreFinancier,
            ScoreAdministrative,
            FinalNote,
            RejectionReason
        });

        const pool = await poolPromise;

        // Execute stored procedure
        const result = await pool.request()
            .input("SessionID", sql.UniqueIdentifier, IdSession)
            .input("OperationID", sql.UniqueIdentifier, IdOperation)
            .input("LotID", sql.UniqueIdentifier, IdLot)
            .input("SupplierID", sql.UniqueIdentifier, IdSupplier)
            .input("AdminNote", sql.TinyInt, ScoreAdministrative) // 0 or 1
            .input("TechnicalNote", sql.Decimal(5, 2), ScoreTechnique) // Can be null
            .input("FinancialNote", sql.Decimal(5, 2), ScoreFinancier) // Can be null
            .input("FinalNote", sql.Decimal(5, 2), FinalNote) // Can be null if admin rejects
            .input("RejectionReason", sql.NVarChar(500), RejectionReason) // New parameter
            .execute("sp_InsertEvaluation");

        // Check if we have a result
        if (result.recordset && result.recordset.length > 0) {
            const response = result.recordset[0];

            if (response.Success === 1) {
                return {
                    success: true,
                    evaluationId: response.EvaluationID,
                    result: response,
                    message: response.Message || "Évaluation ajoutée avec succès."
                };
            } else {
                return {
                    success: false,
                    message: response.Message || "Erreur lors de l'ajout de l'évaluation.",
                    isDuplicate: response.Message?.includes('déjà été évalué') || false
                };
            }
        }

        return {
            success: false,
            message: "Erreur lors de l'ajout de l'évaluation."
        };

    } catch (error) {
        console.error("Error in insertEvaluation:", error);
        return {
            success: false,
            message: "Erreur lors de l'ajout de l'évaluation.",
            error: error.message
        };
    }
};

const getEvaluationByOperationID = async (operationID) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("operationID", sql.UniqueIdentifier, operationID)
            .execute("getEvaluationByOperationID");

        // result.recordsets[0] = first result set (OPERATIONS)
        // result.recordsets[1] = second result set (EVALUATIONS)
        // result.recordsets[2] = potential third set if proc returns it (LOTS/SUPPLIERS)
        // result.recordsets[3] = potential fourth set if proc returns it (LOTS/SUPPLIERS)

        return {
            success: true,
            operation: result.recordsets[0][0] || null,
            evaluations: result.recordsets[1] || [],
            lots: result.recordsets[2] || [],
            suppliers: result.recordsets[3] || [],
            message: "Évaluations récupérées avec succès."
        };
    } catch (error) {
        return {
            success: false,
            message: "Erreur lors de la récupération des évaluations.",
            error: error.message
        };
    }
}

const sendEvaluationEmails = async (adminId, sessionData, isValidation = false) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('adminId', sql.UniqueIdentifier, adminId)
            .query(`SELECT Email FROM dbo.getAllMembresCommission(@adminId)`);

        const members = result.recordset || [];

        const emails = members
            .map(m => m.Email)
            .filter(email => email && email.includes('@'));

        if (emails.length === 0)
            return { success: true, message: 'Aucun email valide trouvé', count: 0 };

        const emailHtml = generateEvaluationEmailHTML(sessionData);

        const emailSubject = isValidation
            ? `Session d'évaluation validée - ${sessionData.sessionId || 'Session'}`
            : `Nouvelle session d'évaluation `;

        const emailResult = await sendEmailToMultiple(emails, emailSubject, emailHtml);
        return emailResult;

    } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
        return { success: false, message: 'Erreur lors de l\'envoi des emails', error: error.message };
    }
};

insertSessionWithOperations = async ({ SessionDateTime, operations, adminId }) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        console.log("insertSessionWithOperations Received:", {
            SessionDateTime,
            operations,
            adminId
        });

        await transaction.begin();

        const SessionID = generateIDS();
        const now = new Date();

        if (!SessionDateTime) {
            throw new Error("SessionDateTime is required");
        }

        const sessionDate = new Date(SessionDateTime);
        if (isNaN(sessionDate.getTime())) {
            throw new Error(`Invalid datetime format: ${SessionDateTime}`);
        }

        const sessionRequest = new sql.Request(transaction);
        sessionRequest.input("SessionID", sql.UniqueIdentifier, SessionID);
        sessionRequest.input("CreatedAt", sql.DateTime2(7), now);
        sessionRequest.input("SessionDateTime", sql.DateTime2(0), sessionDate);
        sessionRequest.input("adminID", sql.UniqueIdentifier, adminId);

        await sessionRequest.query(`
            INSERT INTO SESSIONS (SessionID, CreatedAt, SessionDateTime, adminID)
            VALUES (@SessionID, @CreatedAt, @SessionDateTime, @AdminID)
        `);

        console.log("Session d'évaluation créée avec l'identifiant :", SessionID);

        let operationsCount = 0;
        if (operations && operations.length > 0) {
            for (const operation of operations) {
                const operationRequest = new sql.Request(transaction);
                operationRequest.input("SessionID", sql.UniqueIdentifier, SessionID);
                operationRequest.input("OperationID", sql.UniqueIdentifier, operation.OperationId || operation.id);
                operationRequest.input("Status", sql.TinyInt, 0);

                await operationRequest.query(`
                    INSERT INTO SESSIONOPERATION (SessionID, OperationID, Status)
                    VALUES (@SessionID, @OperationID, @Status)
                `);

                console.log(`L'opération (${operation.OperationId || operation.id}) a été associée à la session`);
                operationsCount++;
            }
        }

        const fetchRequest = new sql.Request(transaction);
        fetchRequest.input("SessionID", sql.UniqueIdentifier, SessionID);

        const sessionResult = await fetchRequest.query(`
            SELECT 
                s.SessionID as sessionId,
                s.SessionDateTime as dateSession,
                s.CreatedAt,
                COUNT(so.OperationID) as operationCount
            FROM SESSIONS s
            LEFT JOIN SESSIONOPERATION so ON s.SessionID = so.SessionID
            WHERE s.SessionID = @SessionID
            GROUP BY s.SessionID, s.SessionDateTime, s.CreatedAt
        `);

        await transaction.commit();

        await sendEvaluationEmails(adminId, sessionResult.recordset[0], false);

        return {
            success: true,
            session: sessionResult.recordset[0],
            operationsCount: operationsCount,
            message: operationsCount > 0
                ? "La session d'évaluation a été créée avec succès avec les opérations sélectionnées."
                : "La session d'évaluation a été créée avec succès (aucune opération associée)."
        };

    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la création de la session d'évaluation :", error);

        return {
            success: false,
            message: "Une erreur est survenue lors de la création de la session d'évaluation.",
            error: error.message
        };
    }
};

getSessionsWithOperations = async (adminId) => {
    const pool = await poolPromise;
    try {
        // Call the new stored procedure with @adminId
        const request = new sql.Request(pool);
        request.input("adminId", sql.UniqueIdentifier, adminId);
        const result = await request.execute("getSessionsWithOperations");

        const sessionsMap = {};

        result.recordset.forEach(row => {
            const sessionId = row.SessionID;
            if (!sessionsMap[sessionId]) {
                sessionsMap[sessionId] = {
                    SessionID: row.SessionID,
                    SessionDateTime: row.SessionDateTime,
                    EvaluationClosed: row.EvaluationClosed,
                    operations: []
                };
            }
            sessionsMap[sessionId].operations.push({
                id: row.OperationID, // Add convenient lowercase id
                OperationID: row.OperationID,
                Numero: row.Numero,
                LotsCount: row.LotsCount
            });
        });

        const sessionsWithOperations = Object.values(sessionsMap);

        return {
            success: true,
            data: sessionsWithOperations
        };

    } catch (error) {
        console.error("Error in getSessionsWithOperations:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des sessions.",
            error: error.message
        };
    }
}

const getMembersBySession = async (SessionID) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("SessionID", sql.UniqueIdentifier, SessionID)
            .execute("getMemebersBySession");
        return {
            success: true,
            members: result.recordset
        };
    } catch (error) {
        console.error("Error in getMembersBySession:", error);
        return {
            success: false,
            message: "Erreur lors de la récupération des membres de la session.",
            error: error.message
        };
    }
};

// Delete a single evaluation using composite keys
const deleteEvaluation = async ({
    SessionID,
    OperationID,
    LotID,
    SupplierID
}) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input("SessionID", sql.UniqueIdentifier, SessionID);
        request.input("OperationID", sql.UniqueIdentifier, OperationID);
        request.input("SupplierID", sql.UniqueIdentifier, SupplierID);
        request.input("LotID", LotID ? sql.UniqueIdentifier : sql.UniqueIdentifier, LotID);

        const result = await request.query(`
            DELETE FROM EVALUATION
            WHERE SessionID = @SessionID
              AND OperationID = @OperationID
              AND SupplierID = @SupplierID
              AND (
                    (@LotID IS NULL AND LotID IS NULL)
                 OR ( @LotID IS NOT NULL AND LotID = @LotID )
              )
        `);

        const rowsAffected = result.rowsAffected?.[0] || 0;

        return {
            success: rowsAffected > 0,
            rowsAffected,
            message: rowsAffected > 0
                ? "Évaluation supprimée avec succès."
                : "Aucune évaluation trouvée avec les critères fournis."
        };
    } catch (error) {
        console.error("Error in deleteEvaluation:", error);
        return {
            success: false,
            message: "Erreur lors de la suppression de l'évaluation.",
            error: error.message
        };
    }
};

// Update Session Presence
const updateSessionPresence = async (SessionID, MemberID, Status) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input("SessionID", sql.UniqueIdentifier, SessionID);
        request.input("MemberID", sql.UniqueIdentifier, MemberID);
        request.input("Status", sql.TinyInt, Status);

        // Using MERGE to insert or update presence
        const result = await request.query(`
            MERGE INTO SESSIONPRESENCE AS Target
            USING (SELECT @SessionID AS SessionID, @MemberID AS MemberID) AS Source
            ON Target.SessionID = Source.SessionID AND Target.MemberID = Source.MemberID
            WHEN MATCHED THEN
                UPDATE SET Status = @Status
            WHEN NOT MATCHED THEN
                INSERT (SessionID, MemberID, Status)
                VALUES (@SessionID, @MemberID, @Status);
        `);

        return {
            success: true,
            message: "Présence mise à jour avec succès."
        };
    } catch (error) {
        console.error("Error in updateSessionPresence:", error);
        return {
            success: false,
            message: "Erreur lors de la mise à jour de la présence.",
            error: error.message
        };
    }
};

const closeSessionEvaluation = async (sessionId) => {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Close the session
            await transaction.request()
                .input('sessionId', sql.UniqueIdentifier, sessionId)
                .query('UPDATE SESSIONS SET EvaluationClosed = 1 WHERE SessionID = @sessionId');
            await transaction.request()
                .input('sessionId', sql.UniqueIdentifier, sessionId)
                .query(`
                    UPDATE OPERATIONS 
                    SET State = 4 
                    WHERE Id IN (
                        SELECT DISTINCT so.OperationID 
                        FROM SESSIONOPERATION so
                        JOIN EVALUATION e ON so.SessionID = e.SessionID AND so.OperationID = e.OperationID
                        WHERE so.SessionID = @sessionId
                    )
                `);

            await transaction.commit();
            return { success: true, message: "Évaluation de la session clôturée avec succès et opérations transférées au budget." };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error in closeSessionEvaluation:', error);
        return { success: false, error: error.message };
    }
};

const deleteOperationFromSession = async (sessionId, operationId) => {
    try {
        const pool = await poolPromise;

        // Requirement: Only allow deletion if operation status ≠ evaluated
        // We check if there are any evaluations for this operation in this session
        const checkEval = await pool.request()
            .input('SessionID', sql.UniqueIdentifier, sessionId)
            .input('OperationID', sql.UniqueIdentifier, operationId)
            .query('SELECT COUNT(*) as count FROM EVALUATION WHERE SessionID = @SessionID AND OperationID = @OperationID');

        if (checkEval.recordset[0].count > 0) {
            return {
                success: false,
                message: "Impossible de supprimer l'opération : elle a déjà été évaluée dans cette session."
            };
        }

        const result = await pool.request()
            .input('SessionID', sql.UniqueIdentifier, sessionId)
            .input('OperationID', sql.UniqueIdentifier, operationId)
            .query('DELETE FROM SESSIONOPERATION WHERE SessionID = @SessionID AND OperationID = @OperationID');

        return {
            success: result.rowsAffected[0] > 0,
            message: result.rowsAffected[0] > 0
                ? "Opération retirée de la session avec succès."
                : "Opération non trouvée dans cette session."
        };
    } catch (error) {
        console.error("Error in deleteOperationFromSession:", error);
        return { success: false, message: "Erreur lors de la suppression de l'opération de la session.", error: error.message };
    }
};

module.exports = {
    insertEvaluation,
    getMembersBySession,
    getEvaluationByOperationID,
    getSessionsWithOperations,
    insertSessionWithOperations,
    updateSessionPresence,
    closeSessionEvaluation,
    deleteOperationFromSession
};
