const ApPartitionsServices = require('../../Services/sqlServer/ApPartitonServices');

module.exports = {
    getPartitonsByOperationId: async (req, res) => {
        try {
            const { operationId } = req.params;
            const result = await ApPartitionsServices.getPartitonsByOperationId(operationId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getPartitionDetails: async (req, res) => {
        try {
            const { partitionId } = req.params;
            const { operationId } = req.query;
            const result = await ApPartitionsServices.getPartitionDetails(operationId, partitionId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createApPartition: async (req, res) => {
        try {
            const { operationId, travauxType, description, budget } = req.body;
            const result = await ApPartitionsServices.createApPartition(operationId, travauxType, description, budget);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateApPartition: async (req, res) => {
        try {
            const { id, description, budget } = req.body;
            const result = await ApPartitionsServices.updateApPartition(id, description, budget);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteApPartiton: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await ApPartitionsServices.deleteApPartiton(id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
}