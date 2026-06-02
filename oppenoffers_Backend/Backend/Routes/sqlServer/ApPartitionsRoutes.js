const express = require('express');
const router = express.Router();
const apPartitionsController = require('../../Controllers/sqlServer/ApPartitonsController');

router.get('/:partitionId/details', apPartitionsController.getPartitionDetails);
router.get('/getPartitonsByOperationId/:operationId', apPartitionsController.getPartitonsByOperationId);
router.post('/createApPartition', apPartitionsController.createApPartition);
router.put('/updateApPartition', apPartitionsController.updateApPartition);
router.delete('/deleteApPartiton/:id', apPartitionsController.deleteApPartiton);

module.exports = router;
