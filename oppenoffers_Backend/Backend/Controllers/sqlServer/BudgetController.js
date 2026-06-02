const budgetServices = require('../../Services/sqlServer/BudgetServices.js');

module.exports = {
    insertEngagement: async (req, res) => {
        try {
            const result = await budgetServices.insertEngagement(req.body);
            res.json(result);
        } catch (error) {
            console.error("Budget controller error (insertEngagement):", error);
            res.status(500).json({
                success: false,
                code: 5000,
                message: "General error occurred.",
                error: error.message,
            });
        }
    },
    selectEngagementsAndPaymentByOperation: async (req, res) => {
        try {
            const { operationId } = req.params;

            const result = await budgetServices.selectEngagementsAndPaymentByOperation(operationId);

            if (result.success) {
                // Return 200 OK with the joined engagement and payment data
                return res.status(200).json(result);
            } else {
                // If the service returned success: false (database error)
                return res.status(500).json(result);
            }

        } catch (error) {
            console.error("Budget controller error (selectEngagementsByOperation):", error);
            res.status(500).json({
                success: false,
                code: 5000,
                message: "An unexpected server error occurred.",
                error: error.message,
            });
        }
    },

    validateEngagement: async (req, res) => {
        try {
            const result = await budgetServices.validateEngagement(
                req.params.id,
                req.body.visaCf,
                req.body.dateVisa,
                req.body.adminId
            );

            res.json(result);

        } catch (error) {
            console.error("Controller error:", error);

            res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message,
            });
        }
    },

    uploadEngagementPDF: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'PDF uploaded successfully',
                path: req.file.path
            });

        } catch (error) {
            console.error("upload PDF error:", error);
            res.status(500).json({
                success: false,
                message: 'Upload failed',
                error: error.message
            });
        }
    }

}