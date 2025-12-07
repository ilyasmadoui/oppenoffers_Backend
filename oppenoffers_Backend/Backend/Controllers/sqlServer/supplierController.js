const supplierService = require("../../Services/sqlServer/supplierService");

module.exports = {
  addSupplier: async (req, res) => {
        try {
            const data = req.body;
            const result = await supplierService.addSupplierSQL(data);

            res.status(200).json({
                code: result.code
            });
        } catch (error) {
            console.error('Controller error (Supplier):', error);
            res.status(500).json({ success: false, message: error.message });
        }
  },
};