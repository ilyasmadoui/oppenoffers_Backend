const supplierService = require("../../Services/sql/supplierService");

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

    getAllSuppliers: async (req, res) => {
        try {
            const { adminID } = req.query;
            const result = await supplierService.getAllSuppliersSQL(adminID);

            res.status(200).json({
                success: result.success,
                suppliers: result.data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                suppliers: []
            });
        }
    },


    deleteSupplier: async (req, res) => {
        try {
            const { id } = req.params;

            const result = await supplierService.deleteSupplierSQL(id);

            res.status(200).json({ success: result.success });
        } catch (error) {
            console.error('Controller error (deleteSupplier):', error);
            res.status(500).json({ success: false });
        }
    },

    updateSupplier: async (req, res) => {
        try {
            const data = req.body;

            const result = await supplierService.updateSupplierSQL(data);

            return res.status(200).json({
                success: result.success,
                code: result.code,
                message: result.message
            });

        } catch (error) {
            console.error('Controller error (updateSupplier):', error);
            return res.status(500).json({
                success: false,
                code: 5000,
                message: "Erreur serveur."
            });
        }
    },



    insertSelectedSupplier: async (req, res) => {
        try {
            const data = req.body;
            const result = await supplierService.insertSelectedSupplier(data);

            if (result.success) {
                return res.status(200).json({ success: true });
            }

            if (result.code === 1004 || result.code === 1005) {
                return res.status(400).json(result);
            }

            return res.status(500).json(result);

        } catch (error) {
            console.error("Controller error:", error);
            res.status(500).json({
                success: false,
                code: 5000,
                message: "Erreur lors de l'ajout du fournisseur."
            });
        }
    },
};
