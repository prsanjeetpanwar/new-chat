import express from "express";
import dotenv from "dotenv"
import  authRoutes  from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import chatRoutes from './routes/chat.route.js'
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config()



const app=express()

app.use(express.json())

app.use(cookieParser());
const port=process.env.PORT

 
app.use('/api/auth',authRoutes)
app.use(`/api/users`,userRoutes)
app.use('/api/chat', chatRoutes)


app.listen(5001,()=>{
console.log(`Server is running on port ${port}`)
connectDB()
})

