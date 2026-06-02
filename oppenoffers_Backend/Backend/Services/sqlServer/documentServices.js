const { sql, poolPromise } = require('../../Config/dbSqlServer');

/**
 * Inserts a new document record into SESSION_DOCUMENTS.
 */
const insertDocumentService = async (documentData) => {
    try {
        const { SessionID, OperationID, AdminID, DocumentType, FileName, FilePath } = documentData;
        const pool = await poolPromise;

        // CHANGE: Use OperationId instead of OperationID (match your table column)
        const result = await pool.request()
            .input('SessionID', sql.UniqueIdentifier, SessionID)
            .input('OperationId', sql.UniqueIdentifier, OperationID)  // ← Changed parameter name
            .input('AdminID', sql.UniqueIdentifier, AdminID)
            .input('DocumentType', sql.NVarChar(50), DocumentType)
            .input('FileName', sql.NVarChar(255), FileName)
            .input('FilePath', sql.NVarChar(500), FilePath)
            .query(`
                INSERT INTO SESSION_DOCUMENTS (SessionID, OperationId, AdminID, DocumentType, FileName, FilePath)
                VALUES (@SessionID, @OperationId, @AdminID, @DocumentType, @FileName, @FilePath);
                SELECT SCOPE_IDENTITY() as Id;
            `);

        return { success: true, message: 'Document saved successfully', id: result.recordset[0].Id };
    } catch (error) {
        console.error('Error in insertDocumentService:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Retrieves all documents for a specific session.
 */
const getDocumentsBySessionService = async (sessionID) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SessionID', sql.UniqueIdentifier, sessionID)
            .query('SELECT * FROM SESSION_DOCUMENTS WHERE SessionID = @SessionID ORDER BY GeneratedAt DESC');

        return { success: true, documents: result.recordset };
    } catch (error) {
        console.error('Error in getDocumentsBySessionService:', error);
        return { success: false, message: error.message };
    }
};

const getDocumentsBySessionAndOperationService = async (sessionID, operationID) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SessionID', sql.UniqueIdentifier, sessionID)
            .input('OperationId', sql.UniqueIdentifier, operationID)  // ← Changed here too
            .query(`
                SELECT * 
                FROM SESSION_DOCUMENTS 
                WHERE SessionID = @SessionID AND OperationId = @OperationId 
                ORDER BY GeneratedAt DESC
            `);
        console.log(result.recordset);
        return { success: true, documents: result.recordset };
    } catch (error) {
        console.error('Error in getDocumentsBySessionAndOperationService:', error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    insertDocumentService,
    getDocumentsBySessionService,
    getDocumentsBySessionAndOperationService
};
