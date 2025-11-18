const lotService = require('../../Services/Lots Services/lotServices');

module.exports = {

  /*insertLotSqlServer: async (req, res) => {
    try {
        const { NumeroLot, id_Operation, Designation, adminId } = req.body;

        if (
            !NumeroLot ||
            !id_Operation ||
            !Designation ||
            !adminId
        ) {
            return res.status(400).json({
                success: false,
                error: "All fields must be filled",
                body: req.body
            });
        }

        const result = await lotService.addNewLotSqlServer(
            NumeroLot,
            id_Operation,
            Designation,
            adminId
        );

        if (result.success) {
            return res.status(201).json({
                success: true,
                code: result.code,
                message: result.message
            });
        } else {
            let status = result.code === 1001 ? 409 : 500;
            return res.status(status).json({
                success: false,
                code: result.code,
                message: result.message,
                error: result.error || undefined
            });
        }
    } catch (error) {
        console.error('Error in insertLotSqlServer:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
},

getAllLotsSqlServer : async(req,res)=>{
    try {
        const { adminID } = req.query;

        if (!adminID) {
                return res.status(400).json({
                    success: false,
                    message: 'adminID is required',
                    data: []
                });
            }
        const result = await lotService.getAllLotsSqlServer(adminID);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Lots retrieved successfully',
                data: result.data,
                count: result.count
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve lots',
                data: []
            });
        }
    } catch (error) {
        console.error('Controller error in getAllLotSqlServer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: []
        });
    }
},

deleteLotSqlServer: async (req, res) => {
  try {
      const { id } = req.params;

      console.log('🔍 Controller received lot ID:', id);

      if (!id) {
          return res.status(400).json({
              success: false,
              message: "Missing lotId parameter"
          });
      }

      const result = await lotService.deleteLotByIdSqlServer(id);

      if (result.success) {
          return res.status(200).json({
              success: true,
              message: result.message
          });
      } else {
          return res.status(404).json({
              success: false,
              message: result.message
          });
      }
  } catch (error) {
      console.error("Controller error in deleteLotSqlServer:", error);
      return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
      });
  }
},
updateLotSqlServer: async (req, res) => {
    try {
        const { id } = req.params;
        const { designation } = req.body;

        if (!id || !designation) {
            return res.status(400).json({
                success: false,
                message: 'Missing id or designation parameter'
            });
        }

        const result = await lotService.updateLotSqlServer(id, designation);

        if (result.success) {
            return res.status(200).json({
                success: true,
                code: result.code,
                message: result.message
            });
        } else if (result.code === 1005) {
            return res.status(404).json({
                success: false,
                code: result.code,
                message: result.message
            });
        } else {
            return res.status(400).json({
                success: false,
                code: result.code,
                message: result.message
            });
        }
    } catch (error) {
        console.error("Controller error in updateLotSqlServer:", error);
        return res.status(500).json({
            success: false,
            code: -1,
            message: "Internal server error",
            error: error.message
        });
    }
},*/

    LotSQL: async (req, res) => {
        try {
            let { NumeroLot, id_Operation, Designation, adminId } = req.body;

            if (!NumeroLot || !id_Operation || !Designation || !adminId) {
                return res.status(400).json({
                    success: false,
                    error: "All fields must be filled",
                    received: req.body
                });
            }

            const result = await lotService.addNewLotSQL(
                NumeroLot,
                id_Operation, 
                Designation,
                adminId
            );

            if (result.success) {
                return res.status(201).json({
                    success: true,
                    code: result.code,
                    message: result.message
                });
            } else {
                const status = result.code === 1001 ? 409 : 500;
                return res.status(status).json({
                    success: false,
                    code: result.code,
                    message: result.message
                });
            }

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },


  
    GetAllLotsSQL: async (req, res) => {
        try {
            const { adminID } = req.query;

            if (!adminID) {
                return res.status(400).json({
                    success: false,
                    message: 'adminID is required',
                    data: []
                });
            }

            const result = await lotService.getAllLotsSQL(adminID);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Lots retrieved successfully',
                    data: result.data,
                    count: result.count
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve lots',
                    data: []
                });
            }

        } catch (error) {
            console.error('Controller error in getAllLotsMySQL:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: []
            });
        }
    },


    UpdateLotSQL: async (req, res) => {
        try {
        const id = req.params.id; 
        const { designation } = req.body;

        if (!designation) {
            return res.status(400).json({ success: false, message: "designation manquant" });
        }

        const { code } = await lotService.updateLotSQL({ id, designation });

        const messages = {
            0: "Désignation mise à jour avec succès.",
            3001: "Lot introuvable.",
            5000: "Erreur SQL interne."
        };

        res.json({
            success: code === 0,
            code,
            message: messages[code] || "Erreur inconnue."
        });

        } catch (error) {
        console.error(" UpdateLotSQL error:", error);
        res.status(500).json({ success: false, message: error.message });
        }
    },

    DeleteLotSQL: async (req, res) => {
        try {
        const lotId = req.params.id;
        const { code } = await lotService.deleteLotSQL(lotId);

        const messages = {
            0: "Lot supprimé avec succès.",
            3001: "Lot introuvable.",
            5000: "Erreur SQL interne."
        };

        res.json({
            success: code === 0,
            code,
            message: messages[code] || "Erreur inconnue."
        });
        } catch (error) {
        console.error("Controller DeleteLotSQL error:", error);
        res.status(500).json({ success: false, message: error.message });
        }
    },
    
};
