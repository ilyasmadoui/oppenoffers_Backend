const supplierService = require("../../Services/sqlServer/supplierService");

module.exports = {

addSupplier: async (req, res) => {
  try {
      const data = req.body;
      const result = await supplierService.addSupplierSQL(data);
      res.status(200).json(result); 
  } catch (error) {
      console.error('Controller error (Supplier):', error);
      res.status(500).json({ success: false, message: error.message });
  }
},

  getAllFournisseurs: async (req, res) => {
    try {
      const { adminID } = req.query;
      const result = await supplierService.selectAllFournisseurs(adminID);
      res.status(200).json({
        success: result.success,
        suppliers: result.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        suppliers: [],
      });
    }
  },

  deleteFournisseur: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await supplierService.deleteFournisseur(id);
      res.status(200).json({ success: result.success });
    } catch (error) {
      console.error("Controller error (deleteFournisseur):", error);
      res.status(500).json({ success: false });
    }
  },

updateFournisseur: async (req, res) => {
  try {
    const data = req.body;
    const result = await supplierService.updateFournisseur(data);
    res.status(200).json(result); 
  } catch (error) {
    console.error("Controller error (updateFournisseur):", error);
    res.status(500).json({ success: false, message: error.message });
  }
},
};