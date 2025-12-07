const express = require('express');
const router = express.Router();
const authController = require('../../Controllers/sqlServer/authController');

router.post("/login", authController.login);

module.exports = router;


