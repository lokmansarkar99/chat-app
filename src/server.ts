import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { logger, errorLogger } from "./shared/logger";
import colors from "colors"
import seedAdmin from "./DB";

// Uncaught Exception Handler - Synchronous Errors  
process.on("uncaughtException", (err) => {
    errorLogger.error(`Uncaught Exception: ${err.message}`)
    logger.info(colors.red("Shutting down the server due to Uncaught Exception"))
    process.exit(1)
})

let server:any;

async function main() {
    try {
        
        await mongoose.connect(config.database_url as string, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        logger.info(colors.green("Databse connected successfully!"))
        seedAdmin();

        const port = Number(config.port)
        server = app.listen(port, () => {
            logger.info(colors.green(`Server is running on port ${port}`))

        })
    } catch (error) {
        errorLogger.error(colors.red(`Error starting the server: ${(error as Error).message}`))
    }
}

main()

// Unhandled Rejection Handler - Asynchronous Errors
process.on("unhandledRejection", (err) => {
    if(server) {
        server.close(() => {
            errorLogger.error(`Unhandled Rejection: ${err}`)
            logger.info(colors.red("Shutting down the server due to Unhandled Rejection"))
            process.exit(1)
        })
    }
    else{
        process.exit(1)
    }
})

// SIGINT Handler - Graceful Shutdown
process.on("SIGINT", () => {
    logger.info(colors.yellow("SIGTERM Received. Shutting down the server gracefully..."))
    if(server)  server.close()
})
