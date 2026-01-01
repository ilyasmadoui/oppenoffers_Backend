const operationService = require('../../Services/sql/operationServices');

module.exports = {
    addOperation: async (req, res) => {
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
    getAllOperations: async (req, res) => {
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
    deleteOperation: async (req, res) => {
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