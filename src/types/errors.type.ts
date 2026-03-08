export interface IErrorMessage { 
    path: string | number,
    message: string
} 
export interface IGenericErrorResponse {
    statusCode: number,
    message: string,
    errorMessages: IErrorMessage[]
}