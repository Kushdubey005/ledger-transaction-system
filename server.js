const app=require('./src/app');
const port=3001;
const connectDb=require('./src/config/db');

connectDb();


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});