const evaluationServices = require("../../Services/sqlServer/evaluationServices");

module.exports = {
    insertEvaluationController: async (req, res) => {
        try {
            const {
                IdSession,
                IdOperation,
                IdLot,
                IdSupplier,
                ScoreTechnique,
                ScoreFinancier,
                ScoreAdministrative,
                FinalNote,
                RejectionReason // New field
            } = req.body;
    
            const result = await evaluationServices.insertEvaluation(
                IdSession,
                IdOperation,
                IdLot,
                IdSupplier,
                ScoreTechnique,
                ScoreFinancier,
                ScoreAdministrative,
                FinalNote,
                RejectionReason // Pass the new field
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de l'ajout de l'évaluation."
            });
        }
    },
    getEvaluationByOperationIDController: async (req, res) => {
        try {
            const { operationID } = req.params;
            if (!operationID) {
                return res.status(400).json({
                    success: false,
                    message: "Le paramètre 'operationID' est requis."
                });
            }
            const result = await evaluationServices.getEvaluationByOperationID(operationID);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    operation: result.operation,
                    evaluations: result.evaluations,
                    lots: result.lots,
                    suppliers: result.suppliers,
                    message: result.message
                });
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des évaluations."
            });
        }
    },

    insertSessionController: async (req, res) => {
        try {
            const { SessionDateTime, operations, adminId } = req.body;
    
            console.log("insertSessionController Received:", { 
                SessionDateTime, 
                operations,
                adminId 
            });
    
            if (!SessionDateTime) {
                return res.status(400).json({
                    success: false,
                    message: "Le champ 'SessionDateTime' est requis."
                });
            }
    
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: "L'ID de l'administrateur est requis."
                });
            }
    
            const result = await evaluationServices.insertSessionWithOperations({
                SessionDateTime,
                operations: operations || [],
                adminId
            });
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in insertSessionController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la création de la session."
            });
        }
    },

    getSessionsController: async (req, res) => {
        try {
            const { adminId } = req.params;
    
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: "L'ID de l'administrateur est requis."
                });
            }
    
            const result = await evaluationServices.getSessionsWithOperations(adminId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in getSessionsController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des sessions."
            });
        }
    },


    getMembersBySessionController: async (req, res) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: "Le paramètre 'sessionId' est requis."
                });
            }

            const result = await evaluationServices.getMembersBySession(sessionId);
            res.status(200).json(result);

        } catch (error) {
            console.error("Error in getMembersBySessionController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des membres de la session."
            });
        }
    },

    deleteEvaluationController: async (req, res) => {
        try {
            const {
                IdSession,
                IdOperation,
                IdLot,
                IdSupplier
            } = req.body;

            if (!IdSession || !IdOperation || !IdSupplier) {
                return res.status(400).json({
                    success: false,
                    message: "Les champs 'IdSession', 'IdOperation' et 'IdSupplier' sont requis."
                });
            }

            const result = await evaluationServices.deleteEvaluation({
                SessionID: IdSession,
                OperationID: IdOperation,
                LotID: IdLot || null,
                SupplierID: IdSupplier
            });

            const statusCode = result.success ? 200 : 404;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Error in deleteEvaluationController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la suppression de l'évaluation."
            });
        }
    },

    updateSessionPresenceController: async (req, res) => {
        try {
            const { SessionID, MemberID, Status } = req.body;

            if (!SessionID || !MemberID || Status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Les champs 'SessionID', 'MemberID' et 'Status' sont requis."
                });
            }

            const result = await evaluationServices.updateSessionPresence(SessionID, MemberID, Status);
            
            const statusCode = result.success ? 200 : 500;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Error in updateSessionPresenceController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la mise à jour de la présence."
            });
        }
    },

    closeSessionEvaluationController: async (req, res) => {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: "Le paramètre 'sessionId' est requis."
                });
            }
            const result = await evaluationServices.closeSessionEvaluation(sessionId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in closeSessionEvaluationController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la clôture de l'évaluation de la session."
            });
        }
    },

    deleteOperationFromSessionController: async (req, res) => {
        try {
            const { sessionId, operationId } = req.params;

            if (!sessionId || !operationId) {
                return res.status(400).json({
                    success: false,
                    message: "Les paramètres 'sessionId' et 'operationId' sont requis."
                });
            }

            const result = await evaluationServices.deleteOperationFromSession(sessionId, operationId);
            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Error in deleteOperationFromSessionController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la suppression de l'opération de la session."
            });
        }
    }
};