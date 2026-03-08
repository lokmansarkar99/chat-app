import { ZodError } from "zod";

import { IErrorMessage, IGenericErrorResponse } from "../types/errors.type";

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errorMessages: IErrorMessage[] = error.issues.map((issue) => ({
    path:    issue.path[issue.path.length - 1] as string,
    message: issue.message,
  }))

  return {
    statusCode:    400,
    message:       "Validation Error",
    errorMessages
  }
}

export default handleZodError