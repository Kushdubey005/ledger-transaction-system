const mongoose=require('mongoose');

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

function connectDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('MongoDB connected successfully');
    }).catch((err)=>{
        console.error('MongoDB connection error:',err);
        process.exit(1);
    });
}

module.exports=connectDB;
