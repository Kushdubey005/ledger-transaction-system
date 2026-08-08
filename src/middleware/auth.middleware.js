const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blackList.model');


async function authMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided', status: "failed" });
    }
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isTokenBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted', status: "failed" });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found', status: "failed" });
        }
        req.user = user;
        next();

    }catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token', status: "failed" });
    }
}
async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided', status: "failed" });
    }
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isTokenBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted', status: "failed" });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select('+systemUser');
        if (!user.systemUser) {
            return res.status(401).json({ message: 'Unauthorized: User is not a system user', status: "failed" });
        }
        req.user = user;
        return next();

    }catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token', status: "failed" });
    }
}
module.exports = { authMiddleware, authSystemUserMiddleware };