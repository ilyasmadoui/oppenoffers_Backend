const paymentServices = require('../../Services/sqlServer/PaymentServices');

module.exports = {
    getAllPayments: async (req, res) => {
        try {
            const result = await paymentServices.getAllPayments();
            res.json(result);
        } catch (error) {
            console.error("Payment controller error:", error);
            res.status(500).json({
                success: false,
                message: "General error occurred.",
                error: error.message,
            });
        }
    },
    updatePayment: async (req, res) => {
        try {
            const { paymentId } = req.params;
            const { date } = req.body;
            const result = await paymentServices.updatePayment(paymentId, date);
            res.json(result);
        } catch (error) {
            console.error("Payment controller error:", error);
            res.status(500).json({
                success: false,
                message: "General error occurred.",
                error: error.message,
            });
        }
    },
    downloadPDF: async (req, res) => {
        try {
            const { paymentId } = req.params;
            const result = await paymentServices.generatePaymentPDFById(paymentId);

            if (!result.success) {
                return res.status(result.code === 404 ? 404 : 500).json({
                    success: false,
                    message: result.message || "Failed to generate payment PDF",
                });
            }

            return res.download(result.pdfPath, `payment_${paymentId}.pdf`);
        } catch (error) {
            console.error("Payment download controller error:", error);
            return res.status(500).json({
                success: false,
                message: "General error occurred.",
                error: error.message,
            });
        }
    },
    uploadPDF: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            res.json({ success: true, message: 'PDF saved successfully', path: req.file.path });
        } catch (error) {
            console.error("Payment PDF upload error:", error);
            res.status(500).json({ success: false, message: 'Failed to upload PDF', error: error.message });
        }
    },
};