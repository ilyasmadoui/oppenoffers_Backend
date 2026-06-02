const express = require('express');
const router = express.Router();
const comissionController = require('../../Controllers/sqlServer/comissionMemebrController');

router.get('/AllCommissionMembers', comissionController.getAllComissionMembersController);
router.post('/addCommissionMember', comissionController.addComissionMemberController);
router.put('/updateCommissionMember/:id', comissionController.updateComissionMemberController);
router.delete('/deleteCommissionMember/:id', comissionController.deleteComissionMemberController);


module.exports = router;
