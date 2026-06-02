const express = require('express');
const router = express.Router();
const authController = require('../../Controllers/sqlServer/authController');

router.post("/login", authController.login);
router.post('/ForgotPassword', authController.forgotPassword)
router.post('/ResetPassword', authController.resetPassword)

module.exports = router;


