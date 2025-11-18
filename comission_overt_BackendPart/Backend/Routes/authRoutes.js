const express = require('express');
const router = express.Router();
const authController = require('../Controllers/User controller/authController');


router.post("/login", authController.loginSQL);
//router.post("/login", authController.loginSqlServer);
module.exports = router;


