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
                    message: 'NumOperation is required'
                });
            }
            
            console.log('Delete controller Recieved Operation number :', NumOperation)
            const result = await operationService.deleteOperationByIdSqlServer(NumOperation);
    
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message || 'Operation deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message || 'Failed to delete operation'
                });
            }
    
        } catch (error) {
            console.error('Controller error in deleteOperationSqlServer:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
}