// operationController.js
const operationService = require('../../Services/Operations Services/operationServices');

module.exports = {
    /*insertOperationSqlServer: async (req, res) => {
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
      
    getAllOperationsSqlServer: async (req, res) => {
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
    deleteOperationSqlServer: async (req, res) => {
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
    },*/

    operationSQL: async (req, res) => {
        try {
            console.log(' Données reçues:', req.body);

            const result = await operationService.addOperationSQL(req.body);

            return res.status(200).json({
                success: true,
                code: result.code
            });

        } catch (error) {
            console.error(' Controller error:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur serveur: ' + error.message
            });
        }
    },


    AllOperationsSQL: async (req, res) => {
        try {
            console.log("📦 Récupération de toutes les opérations...");

            const adminID = req.query.adminID;

            if (!adminID) {
                return res.status(400).json({
                    success: false,
                    message: "adminID est requis",
                });
            }

            const result = await operationService.getAllOperationsSQL(adminID);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: result.message,
                });
            }

            res.status(200).json({
                success: true,
                data: result.data, 
                count: result.count,
            });

        } catch (error) {
            console.error("Controller error (AllOperationsSQL):", error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur: " + error.message,
            });
        }
    },


    removeOperationSQL: async (req, res) => {
    try {
        const { NumOperation } = req.params;

        if (!NumOperation) {
            return res.status(400).json({
                success: false,
                message: "Le numéro d’opération est requis."
            });
        }

        const result = await operationService.deleteOperationSQL(NumOperation);

        if (result.code === 0) {
            res.status(200).json({ success: true, message: "Opération supprimée avec succès." });
        } else if (result.code === 1003) {
            res.status(404).json({ success: false, message: "Opération introuvable ou déjà supprimée." });
        } else {
            res.status(500).json({ success: false, message: "Erreur interne (code 5000)." });
        }

    } catch (error) {
        console.error('Controller error (deleteOperationSQL):', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur: " + error.message
        });
    }
},

}