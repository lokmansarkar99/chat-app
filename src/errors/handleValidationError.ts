
import { Error } from "mongoose"
import { IErrorMessage, IGenericErrorResponse } from "../types/errors.type"

const handleValidationError = (
  error: Error.ValidationError
): IGenericErrorResponse => {
  const errorMessages: IErrorMessage[] = Object.values(error.errors).map(
    (el: Error.ValidatorError | Error.CastError) => ({
      path:    el.path,
      message: el.message,
    })
  )

  return {
    statusCode:    400,
    message:       "Validation Error",
    errorMessages,
  }
}

export default handleValidationError
