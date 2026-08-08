const accountModel = require('../models/account.model');


async function createAccountController(req, res) {
    const user=req.user;
    const account=await accountModel.create({user:user._id});
    res.status(201).json({ message: 'Account created successfully', account, status: "success" });
}
async function getUserAccountsController(req, res) {
    const user=req.user;
    const accounts=await accountModel.find({user:user._id});
    res.status(200).json({ message: 'Accounts fetched successfully', accounts, status: "success" });
} 
async function getAccountBalanceController(req, res) {
    const user=req.user;
    const accountId=req.params.accountId;
    const account=await accountModel.findOne({_id:accountId,user:user._id});
    if(!account){
        return res.status(404).json({ message: 'Account not found', status: "failed" });
    }
    const balance=await account.getBalance();
    res.status(200).json({ message: 'Account balance fetched successfully', balance, status: "success" });
}

module.exports = { createAccountController , getUserAccountsController,getAccountBalanceController};