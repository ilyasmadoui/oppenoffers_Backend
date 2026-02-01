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

        // Map the service result code to the appropriate HTTP status
        switch (result.code) {
            case 0: {
                const resp = {
                    success: true,
                    code: 0,
                    message: "Fournisseur archivé avec succès."
                };
                console.log("deleteFournisseur [SUCCESS]", resp);
                return res.status(200).json(resp);
            }
            case 2000: {
                const resp = {
                    success: false,
                    code: 2000,
                    message: "Impossible de supprimer ce fournisseur car il existe dans une opération de retrait (Retrait Cahier des Charges)."
                };
                console.log("deleteFournisseur [BUSINESS BLOCK - 2000]", resp);
                return res.status(400).json(resp);
            }
            case 2005: {
                const resp = {
                    success: false,
                    code: 2005,
                    message: "Fournisseur introuvable ou déjà archivé."
                };
                console.log("deleteFournisseur [NOT FOUND - 2005]", resp);
                return res.status(404).json(resp);
            }
            default: {
                const resp = {
                    success: false,
                    code: result.code || 5000,
                    message: result.message || "Erreur interne serveur SQL lors de la suppression du fournisseur."
                };
                console.log("deleteFournisseur [ERROR - DEFAULT]", resp);
                return res.status(500).json(resp);
            }
        }
    } catch (error) {
        console.error("Controller error (deleteFournisseur):", error);
        const resp = {
            success: false,
            code: 5000,
            message: "Erreur lors de la suppression du fournisseur.",
            error: error.message
        };
        console.log("deleteFournisseur [EXCEPTION]", resp);
        res.status(500).json(resp);
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

insertSelectedSupplier: async (req, res) => {
  try {
    const data = req.body;
    const result = await supplierService.insertSelectedSupplier(data);

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      // If known service error code (1004, 1005), send 400 with details
      if (result.code === 1004 || result.code === 1005) {
        res.status(400).json({
          success: false,
          code: result.code,
          message: result.message
        });
      } else {
        // Generic service error (backend-side error caught)
        res.status(500).json({
          success: false,
          code: result.code || 5000,
          message: result.message || 'Erreur serveurs lors de l\'ajout du fournisseur existant dans l\'opération.'
        });
      }
    }
  } catch (error) {
    console.error('Controller error (insertSelectedSupplier):', error);
    res.status(500).json({
      success: false,
      code: 5000,
      message: error.message || "Erreur lors de l'ajout du fournisseur existant dans l'opération."
    });
  }
},

};