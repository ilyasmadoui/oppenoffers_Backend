const operationService = require('../../Services/sqlServer/operationServices');

module.exports = {
    insertOperation: async (req, res) => {
        try {
            const {
                NumOperation,
                ServContract,
                Objectif,
                TravalieType,
                BudgetType,
                MethodAttribuation,
                VisaNum,
                DateVisa,
                adminID,
                Program,
                AP
            } = req.body;

            console.log('(Insert operation controller) Received data:', req.body);

            if (
                !NumOperation ||
                !ServContract ||
                !Objectif ||
                !TravalieType ||
                !BudgetType ||
                !MethodAttribuation ||
                !VisaNum ||
                !DateVisa ||
                !adminID
            ) {
                return res.status(400).json({
                    error: "All fields are required.",
                    received: req.body
                });
            }

            const operation = await operationService.addOperationSQLServer(
                NumOperation,
                ServContract,
                Objectif,
                TravalieType,
                BudgetType,
                MethodAttribuation,
                VisaNum,
                DateVisa,
                adminID,
                Program,
                AP
            );

            console.log('Operation result:', operation);

            return res.status(201).json({
                message: "Operation processed successfully.",
                ...operation
            });

        } catch (error) {
            console.error("Error while adding operation:", error.message);
            return res.status(500).json({
                error: "An error occurred while adding the operation.",
                details: error.message,
                code: 5000
            });
        }
    },
    getAllOperations: async (req, res) => {
        try {
            const { adminID } = req.query;

            // Add validation for adminID
            if (!adminID) {
                return res.status(400).json({
                    success: false,
                    message: 'adminID is required',
                    data: []
                });
            }

            const result = await operationService.getAllOperationSQLServer(adminID);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Operations retrieved successfully',
                    data: result.data,
                    count: result.count
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.message || 'Failed to retrieve operations',
                    data: []
                });
            }
        } catch (error) {
            console.error('Controller error in getAllOperations:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: []
            });
        }
    },
    deleteOperation: async (req, res) => {
        try {
            const { operationId } = req.params;

            if (!operationId) {
                return res.status(400).json({
                    success: false,
                    code: 400,  // Add code
                    message: 'NumOperation is required'
                });
            }

            console.log('Delete controller Recieved Operation number :', operationId);
            const result = await operationService.deleteOperationByIdSqlServer(operationId);

            // Handle based on specific return codes
            if (result.success && result.message === "Operation deleted successfully") {
                return res.status(200).json({
                    success: true,
                    code: 0,  // ← ADD THIS LINE
                    message: result.message || 'Operation deleted successfully'
                });
            } else if (result.message === "Operation not found") {
                return res.status(404).json({
                    success: false,
                    code: 1005,  // Already has code
                    message: "Operation not found"
                });
            } else if (result.message === "Operation related to suppliers cannot be deleted") {
                return res.status(409).json({
                    success: false,
                    code: 1000,  // Already has code
                    message: "Related to supplier, impossible to delete"
                });
            } else {
                return res.status(500).json({
                    success: false,
                    code: 5000,  // Already has code
                    message: result.message || 'An error occurred while deleting Operation'
                });
            }
        } catch (error) {
            console.error('Controller error in deleteOperationSqlServer:', error);
            res.status(500).json({
                success: false,
                code: 5000,
                message: 'Internal server error'
            });
        }
    },

    updateOperationState: async (req, res) => {
        try {
            const { operationId } = req.params;
            const { state } = req.body;

            if (!operationId || state === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "operationId and state are required."
                });
            }

            const result = await operationService.updateOperationStateSqlServer(
                operationId,
                state
            );

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: "Operation state updated successfully."
                });
            }

            return res.status(400).json({
                success: false,
                message: "Failed to update operation state."
            });

        } catch (error) {
            console.error("Error in updateOperationState controller:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    manageArchiveOperation: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'Operation id is required'
                });
            }

            const result = await operationService.manageArchiveOperationSqlServer(id);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    code: result.code,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    code: result.code || 5000,
                    message: result.message
                });
            }
        } catch (error) {
            console.error('Controller error in manageArchiveOperation:', error);
            res.status(500).json({
                success: false,
                code: 5000,
                message: 'Internal server error',
                error: error.message
            });
        }
    },

    getOperationById: async (req, res) => {
        try {
            const { op } = req.params;

            if (!op) {
                return res.status(400).json({
                    success: false,
                    message: "Operation id is required"
                });
            }

            const result = await operationService.getOperationByIdSqlServer(op);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    operation: result.operation,
                    lots: result.lots,
                    announces: result.announces,
                    message: result.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.message || "Database error occurred in getOperationByIdSqlServer.",
                    error: result.error
                });
            }
        } catch (error) {
            console.error("Controller error in getOperationById:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    updateOperation: async (req, res) => {
        try {
            console.log('🔍 [Controller] Received update request:', {
                body: req.body,
                headers: req.headers
            });

            const {
                Id,
                NumOperation,
                ServContract,
                Objectif,
                TravalieType,
                BudgetType,
                MethodAttribuation,
                VisaNum,
                DateVisa,
                adminID,
                Program,
                AP
            } = req.body || {};

            console.log('🔍 [Controller] Extracted values:', {
                Id,
                NumOperation,
                adminID: adminID,
                hasAdminID: !!adminID,
                Program,
                AP
            });

            const result = await operationService.updateOperationSqlServer({
                Id,
                NumOperation,
                ServContract,
                Objectif,
                TravalieType,
                BudgetType,
                MethodAttribuation,
                VisaNum,
                DateVisa,
                adminID: adminID,
                Program,
                AP
            });

            console.log('🔍 [Controller] Service result:', result);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    code: result.code,
                    message: result.message,
                    id: result.id,
                });
            }

            const status =
                result.code === 1005
                    ? 404
                    : result.code === 400
                        ? 400
                        : 500;

            return res.status(status).json({
                success: false,
                code: result.code,
                message: result.message,
                error: result.error,
            });
        } catch (error) {
            console.error("❌ [Controller] Error in updateOperation:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    },
    validateOperation: async (req, res) => {
        try {
            const { operationId } = req.params;

            if (!operationId) {
                return res.status(400).json({
                    success: false,
                    message: "operationId parameter is required."
                });
            }

            const result = await operationService.validateOperationSqlServer(operationId);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error || undefined
                });
            }
        } catch (error) {
            console.error("❌ [Controller] Error in validateOperation:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    getOperationsByDateController: async (req, res) => {
        try {
            const { adminId, sessionDate } = req.body;

            if (!adminId || !sessionDate) {
                return res.status(400).json({
                    success: false,
                    message: "adminId et sessionDate sont requis"
                });
            }

            const result = await operationService.getOperationsByDate(adminId, sessionDate);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in getOperationsByDateController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des opérations"
            });
        }
    },

    getOperationForBudgetManagementController: async (req, res) => {
        try {
            const { adminId } = req.query;

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: "adminId est requis"
                });
            }

            const result = await operationService.getOperationForBudgetManagement(adminId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in getOperationForBudgetManagementController:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des opérations"
            });
        }
    }

}