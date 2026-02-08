const lotService = require('../../Services/sqlServer/lotServices');

module.exports = {
insertLot: async (req, res) => {
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
getAllLots: async (req, res) => {
    try {
        const { adminID, operationID } = req.query;

        if (!adminID || !operationID) {
            return res.status(400).json({
                success: false,
                message: 'adminID and operationID are required',
                data: []
            });
        }

        const result = await lotService.getAllLotsSqlServer(adminID, operationID);
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
        console.error('Controller error in getAllLots:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: []
        });
    }
},

updateLot: async (req, res) => {
    try {
      const { id } = req.params;
      const { designation } = req.body;
  
      console.log('🔍 Controller received:', { id, designation });
  
      if (!id || !designation) { 
        return res.status(400).json({
          success: false,
          message: "Missing lotId or designation parameter"
        });
      }
  
      const result = await lotService.updateLotSqlServer(id, designation);
  
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
      console.error("Controller error in updateLot:", error); // Fixed log name
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },
deleteLot: async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing Lot ID'
            });
        }
        console.log("Controllers Del lot recieved : ", id);
        const result = await lotService.deleteLotByIdSqlServer(id);

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
},
}