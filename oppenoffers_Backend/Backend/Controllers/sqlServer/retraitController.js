const retraitService = require('../../Services/sqlServer/retraitServices');

module.exports = {

    createRetrait: async (req, res) => {
        try {
            const data = req.body;

            if (!data.SupplierID || !data.OperationID || !data.NumeroRetrait) {
                return res.status(400).json({
                    success: false,
                    message: "SupplierID, OperationID et NumeroRetrait sont requis."
                });
            }

            const result = await retraitService.createRetraitSQL(data);

            switch (result.code) {
                case 0:
                    return res.status(200).json({
                        success: true,
                        message: "Retrait enregistré avec succès",
                        data: result.data
                    });

                case 1001:
                    return res.status(400).json({
                        success: false,
                        message: "Le numéro de retrait existe déjà pour cette opération"
                    });

                default:
                    return res.status(500).json({
                        success: false,
                        message: "Erreur serveur (code " + result.code + ")"
                    });
            }

        } catch (error) {
            console.error('Controller error (Retrait):', error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur: " + error.message
            });
        }
    },

    getSuppliersWithOperations: async (req, res) => {
        try {
            const { adminId } = req.params;

            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    message: "adminId est requis"
                });
            }

            const result = await retraitService.getSuppliersWithOperationsSQL(adminId);

            if (result.code !== 0) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur serveur"
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data
            });

        } catch (error) {
            console.error('Controller error (GetSuppliers):', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteRetrait: async (req, res) => {
        try {
            const { supplierId, operationId } = req.query;

            if (!supplierId || !operationId) {
                return res.status(400).json({
                    success: false,
                    message: "SupplierID et OperationID sont requis.",
                    code: 1001
                });
            }

            const result = await retraitService.deleteRetraitSQL(
                supplierId,
                operationId
            );

            return res.status(200).json({
                success: result.code === 0,
                message:
                    result.code === 0
                        ? "Retrait supprimé avec succès"
                        : "Aucun retrait trouvé avec ces informations",
                code: result.code
            });

        } catch (error) {
            console.error('Controller error (deleteRetrait):', error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                code: 5000
            });
        }
    }
};
