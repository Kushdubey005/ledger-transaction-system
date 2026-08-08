const mongoose = require('mongoose');


const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
},{
    timestamps: true
});

tokenBlacklistSchema.index({createdAt: 1}, {expireAfterSeconds: 60*60*24*3}); // Index to automatically remove documents after 3 days (60 seconds * 60 minutes * 24 hours * 3 days)
const tokenBlacklistModel = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
module.exports = tokenBlacklistModel;