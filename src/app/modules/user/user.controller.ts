import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { User } from "./user.model";
export const getMe = (req: Request, res: Response) => {

    console.log(req.user)
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};



const getMyProfile = catchAsync(async(req:Request, res:Response) => {

  const userId = req.user?.id
  const result = await UserService.getMyProfile(userId)
  sendResponse(res , {
  success:true,
  message: "Profile fetched successfully",
  statusCode: StatusCodes.OK,
  data: result
})
})



const updateProfile = catchAsync(async (req: Request, res: Response) => {

  const userId = req.user?.id
  const payload = req.body
  const files = req.files
    const result = await UserService.updateMyProfile(userId, payload, files)

  sendResponse(res , {
    success: true,
    message: "User updated successfully",
    statusCode: StatusCodes.OK,
    data: result 
  })
})



const allUsers = catchAsync(async (req:Request, res: Response) => {

    const result = await UserService.getAllUsers(req.query)

      console.log(result)
    sendResponse(res, {
      success: true,
      message: "All user fetched successfullyly",
      statusCode: StatusCodes.OK,
      data: result
    })
})


const updateUserStatus = catchAsync(async(req:Request, res:Response) => {

  const result = await UserService.updateUserStatus(req.params.id as string, req.body)

  sendResponse(res, {
    success: true,
    message: "User Status Updated",
    statusCode: StatusCodes.OK,
    data: result
  })

})

export const userController = {  
    getMe,
    getMyProfile,
    updateProfile,
    allUsers,
    updateUserStatus

}


