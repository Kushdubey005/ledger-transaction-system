const express=require('express');
const app=express();
const cookieParser=require('cookie-parser');
//middleware
app.use(cookieParser());
app.use(express.json());

//routes required
const accountRouter=require('./routes/account.routes');
const authRouter=require('./routes/auth.routes');
const transactionRouter=require('./routes/transaction.routes');
//use routes
app.use('/api/account',accountRouter);
app.use('/api/auth',authRouter);
app.use('/api/transaction',transactionRouter);


app.get('/',(req,res)=>{
    res.send('Ledger Transaction System API is running');
});

module.exports=app;