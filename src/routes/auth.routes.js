const express = require('express');
const router = express.Router();
const authController=require('../controller/auth.controller');
//../api/auth/register
router.post('/register', authController.userRegisterController);

//../api/auth/login
router.post('/login', authController.userLoginController);

//../api/auth/logout
router.post('/logout', authController.userLogoutController);


module.exports = router;