const express=require('express')
const colors=require('colors')
const morgan=require('morgan')
const cors=require('cors')
const dotenv=require('dotenv');
const connectDB = require('./config/db');
const path=require('path')
dotenv.config();
connectDB();
const app=express()
app.use(cors()) 
app.use(express.json())
app.use(morgan('dev'))
app.use("/api/v1/user",require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.use(express.static(path.join(__dirname,"./client/build")))
app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,"./client/build/index.html"))
})
const port=process.env.PORT ||8080

app.listen(port,()=>{
    console.log(`server running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`)
})