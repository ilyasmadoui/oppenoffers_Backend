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
            adminID
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
            adminID
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
          const { NumOperation } = req.params;
      
          if (!NumOperation) {
            return res.status(400).json({
              success: false,
              code: 400,  // Add code
              message: 'NumOperation is required'
            });
          }
      
          console.log('Delete controller Recieved Operation number :', NumOperation);
          const result = await operationService.deleteOperationByIdSqlServer(NumOperation);
      
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
}