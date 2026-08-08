const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controller/account.controller');


//post /api/account/
//create new account
//protected route
router.post('/',authMiddleware.authMiddleware,accountController.createAccountController);

//get /api/account/
//get account details of logged in user
//protected route
router.get('/',authMiddleware.authMiddleware,accountController.getUserAccountsController);

//get /api/account/balance/:accountId
router.get('/balance/:accountId',authMiddleware.authMiddleware,accountController.getAccountBalanceController);


module.exports = router;