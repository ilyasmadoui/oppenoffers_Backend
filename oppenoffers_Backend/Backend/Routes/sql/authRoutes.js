const express = require('express');
const router = express.Router();
const authController = require('../../Controllers/sql/authController');

router.post('/login', authController.login);
router.post('/ForgotPassword', authController.ForgotPassword)
router.post('/ResetPassword', authController.ResetPassword)

module.exports = router;