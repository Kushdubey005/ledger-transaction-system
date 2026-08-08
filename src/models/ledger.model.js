const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Ledger entry must be associated with an account'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'Ledger entry amount is required'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Ledger entry must be associated with a transaction'],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ['credit', 'debit'],
            message: 'Ledger entry type can be either credit or debit'
        },
        required: [true, 'Ledger entry type is required'],
        immutable: true
    }
}, {
    timestamps: true    
});


function preventLedgerModification() {
    throw new Error('Ledger entries cannot be modified or deleted');    
};

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);


const ledgerModel = mongoose.model('Ledger', ledgerSchema);
module.exports = ledgerModel;