const transactionModel=require('../models/transaction.model');
const ledgerModel=require('../models/ledger.model');
const emailService=require('../services/email.service');
const accountModel=require('../models/account.model');
const mongoose=require('mongoose');

//Create new transaction
/*
 * THE 10-STEP TRANSFER FLOW:
 *
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req,res){

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // Step 1: Validate request
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ error: 'Missing required fields' });
    }   
    const fromAccountDoc = await accountModel.findOne({ _id: fromAccount });
    const toAccountDoc = await accountModel.findOne({ _id: toAccount });


    if (!fromAccountDoc || !toAccountDoc) {
        return res.status(404).json({ error: 'One or both accounts not found' });
    }

    // Step 2: Validate idempotency key
    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey });
    if (isTransactionAlreadyExists) {
        if(isTransactionAlreadyExists.status==='completed'){
            return res.status(200).json({ message: 'Transaction already completed' });
        }
        if(isTransactionAlreadyExists.status==='pending'){
            return res.status(200).json({ message: 'Transaction is still pending' });
        }
        if(isTransactionAlreadyExists.status==='failed'){
            return res.status(500).json({ message: 'Transaction has failed' });
        }
        if(isTransactionAlreadyExists.status==='reversed'){
            return res.status(500).json({ message: 'Transaction has been reversed' });
        }
    }   

    // Step 3: Check account status
    if (fromAccountDoc.status !== 'ACTIVE' || toAccountDoc.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'One or both accounts are not active' });
    }   
    
    // Step 4: Derive sender balance from ledger
    const balance =await fromAccountDoc.getBalance();
    if(balance<amount){
        return res.status(400).json({ error: `Insufficient funds. Current balance is  ${balance} and Requested amount is ${amount}` });
    }

    // Step 5: Create transaction (PENDING)
    let transaction;
    try {
    const session = await mongoose.startSession();
    session.startTransaction();

     transaction =(await transactionModel.create([{ 
        fromAccount, toAccount, amount, idempotencyKey ,
        status:'pending'
    }], { session }))[0];

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: 'debit'
    }], { session });
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: 'credit'
    }], { session });

    await transactionModel.findOneAndUpdate({ _id: transaction._id }, { status: 'completed' }, { session });
    await session.commitTransaction();
    await session.endSession();
}catch (error) {
    return res.status(400).json({ message: "Transaction is pending due to some issue. Please try again later" });
}

    // Step 10: Send email notification
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccountDoc._id);

    return res.status(201).json({ message: 'Transaction completed successfully', transactionId: transaction._id });


} 

async function createInitialFundsTransaction(req,res){
    const { toAccount, amount, idempotencyKey } = req.body;

    // Step 1: Validate request
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ error: 'Missing required fields' });
    }   
    const toUserAccountDoc = await accountModel.findOne({ _id: toAccount });
    if(!toUserAccountDoc){
        return res.status(404).json({ error: 'Target account not found' });
    }
    const fromUserAccount=await accountModel.findOne(
        { 
          user:req.user._id,
        }
    );
    if(!fromUserAccount){
        return res.status(404).json({ error: 'System user account not found' });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    const transaction =new transactionModel({
        fromAccount:fromUserAccount._id, 
        toAccount,
        amount,
        idempotencyKey,
        status:'pending'
    });
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: 'debit'
    }], { session });
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: 'credit'
    }], { session });

    transaction.status = 'completed';
    await transaction.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return res.status(201).json({ message: 'Initial funds transaction completed successfully', transactionId: transaction._id });

}

module.exports={createTransaction,createInitialFundsTransaction};