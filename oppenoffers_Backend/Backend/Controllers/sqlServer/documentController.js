const {
    insertDocumentService,
    getDocumentsBySessionService,
    getDocumentsBySessionAndOperationService
} = require('../../Services/sqlServer/documentServices');

const uploadDocumentController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { SessionID, OperationID, AdminID, DocumentType } = req.body;

        if (!SessionID || !OperationID || !AdminID || !DocumentType) {
            return res.status(400).json({ success: false, message: 'Missing required metadata' });
        }

        const documentData = {
            SessionID,
            OperationID,
            AdminID,
            DocumentType,
            FileName: req.file.filename,
            FilePath: `/uploads/documents/${req.file.filename}`
        };

        const result = await insertDocumentService(documentData);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in uploadDocumentController:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Retrieves documents for a specific session.
 */
const getDocumentsBySessionController = async (req, res) => {
    try {
        const { sessionID } = req.params;
        const result = await getDocumentsBySessionService(sessionID);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in getDocumentsBySessionController:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDocumentsBySessionAndOperationController = async (req, res) => {
    try {
        const { sessionID, operationID } = req.params;
        const result = await getDocumentsBySessionAndOperationService(sessionID, operationID);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in getDocumentsBySessionAndOperationController:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadDocumentController,
    getDocumentsBySessionController,
    getDocumentsBySessionAndOperationController
};
