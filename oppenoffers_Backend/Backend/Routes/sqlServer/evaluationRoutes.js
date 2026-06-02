const express = require('express');
const router = express.Router();

const evaluationControllers = require("../../Controllers/sqlServer/evaluationController");

router.post("/addEvaluation", evaluationControllers.insertEvaluationController);
router.post("/addSession", evaluationControllers.insertSessionController);
router.get("/sessions/:adminId", evaluationControllers.getSessionsController);
router.get("/membersBySession/:sessionId", evaluationControllers.getMembersBySessionController);
router.get("/evaluationsByOperation/:operationID", evaluationControllers.getEvaluationByOperationIDController);
router.post("/deleteEvaluation", evaluationControllers.deleteEvaluationController);
router.post("/presence", evaluationControllers.updateSessionPresenceController);
router.patch("/closeSession/:sessionId", evaluationControllers.closeSessionEvaluationController);
router.delete("/sessions/:sessionId/operations/:operationId", evaluationControllers.deleteOperationFromSessionController);

module.exports = router;