
import { ErrorRequestHandler } from "express"
import { ZodError } from "zod"
import { Error as MongooseError } from "mongoose"
import config from "../../config"
import ApiError from "../../errors/ApiErrors"
import handleValidationError from "../../errors/handleValidationError"
import handleZodError from "../../errors/handleZodError"
import { errorLogger } from "../../shared/logger"
import { IErrorMessage } from "../../types/errors.type"
import { StatusCodes } from "http-status-codes"
import { RESPONSE_MODE } from "../../constants/responseMode"
import { responseMode } from "../../config/responseMode"

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  config.node_env === "development"
    ? console.log(" globalErrorHandler", error)
    : errorLogger.error(" globalErrorHandler", error)

  let statusCode = 500
  let message = "Something went wrong"
  let errorMessages: IErrorMessage[] = []

  if (error.name === "ZodError") {
    const simplified = handleZodError(error)
    statusCode = simplified.statusCode
    message = simplified.message
    errorMessages = simplified.errorMessages

  } else if (error.name === "ValidationError") {
    const simplified = handleValidationError(error)
    statusCode = simplified.statusCode
    message = simplified.message
    errorMessages = simplified.errorMessages

  } else if (error.name === "TokenExpiredError") {
    statusCode = StatusCodes.UNAUTHORIZED
    message = "Session Expired"
    errorMessages = [{ path: "", message: "Your session has expired. Please log in again." }]

  } else if (error.name === "JsonWebTokenError") {
    statusCode = StatusCodes.UNAUTHORIZED
    message = "Invalid Token"
    errorMessages = [{ path: "", message: "Your token is invalid. Please log in again." }]

  } else if (error.name === "CastError") {
    statusCode = StatusCodes.BAD_REQUEST
    message = "Invalid ID"
    errorMessages = [{ path: "", message: `Invalid ObjectId: ${error.value}` }]

  } else if (error.code === 11000) {
    // MongoDB duplicate key
    const field = Object.keys(error.keyValue)[0]
    statusCode = StatusCodes.CONFLICT
    message = `${field} already exists`
    errorMessages = [{ path: field, message: `${field} already exists` }]

  } else if (error instanceof ApiError) {
    statusCode = error.statusCode
    message = error.message
    errorMessages = error.message ? [{ path: "", message: error.message }] : []

  } else if (error instanceof Error) {
    message = error.message
    errorMessages = error.message ? [{ path: "", message: error.message }] : []
  }

  // SOFT vs STRICT mode
  if (responseMode === RESPONSE_MODE.SOFT) {
    return res.status(200).json({
      success: false,
      message,
      errorMessages,
      data: [],
      stack: config.node_env !== "production" ? error?.stack : undefined,
    })
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.node_env !== "production" ? error?.stack : undefined,
  })
}

export default globalErrorHandler
