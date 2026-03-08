import express,  {Application ,  Request, Response} from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import {StatusCodes} from "http-status-codes"
import {Morgan} from "./shared/morgan"
import router from "./app/routes"
import globalErrorHandler from "./app/middlewares/globalErrorHandler"
import { globalRateLimiter } from "./app/middlewares/rateLimiter"   
import config from "./config"

import passport from './config/passport'

const app:Application = express()

// Logger - Morgan
app.use(Morgan.successHandler)
app.use(Morgan.errorHandler)

// Rate Limiter
app.use(globalRateLimiter)


// CORS
app.use(cors( {
    origin: config.client_url,
    credentials: true   
}))



// Parsers
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// Passport
app.use(passport.initialize())

// Static Files

// Health Check
app.get("/", (_req:Request, res:Response) => {
    res.status(StatusCodes.OK).json({
        success:true,
        message: "Server is running",
    })
})

// API Routes
app.use("/api/v1", router)
app.use("/api/v1/uploads", express.static('uploads'))

// 404 Handler

app.use((req: Request, res:Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success:false,
        message: "Not Found",
        errorMessages: [{ path: req.originalUrl, message: "API Doesn't Exist"}]
    })
})


// Global Error Handler
app.use(globalErrorHandler)

export default app;