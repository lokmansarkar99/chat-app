import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import unlinkFile from "../../../shared/unLinkFIle";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { User } from "./user.model";
import type { UpdateMyProfilePayload, UpdateUserStatusPayload } from "./user.validation";

import { STATUS } from "../../../enums/user";



//Get My Profile 
const getMyProfile = async (userId: string) => {
    const user = await User.findById(userId)

    if(!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User Not FOund") 
    }

    if(user.isDeleted) {
        throw new ApiError(StatusCodes.FORBIDDEN, "User is deleted")
    }
    return user 
} 


const updateMyProfile = async (
  userId:  string,
  payload: UpdateMyProfilePayload,
  files:   any
) => {
  // ✅ Step 1: DB থেকে current user load (fresh data)
  const user = await User.findById(userId);
  if (!user)          throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  if (user.isDeleted) throw new ApiError(StatusCodes.FORBIDDEN, 'Account deleted');

  // ✅ Step 2: নতুন image এসেছে কিনা check
  const newImagePath = getSingleFilePath(files, 'profileImage');
  // newImagePath = "/user/new-image-1772077371074.jpg"  (getFilePath return করে)

  if (newImagePath) {
    // ✅ Step 3: OLD image আছে কিনা check করে delete
    if (user.profileImage) {
      // user.profileImage = "/user/old-image-123.jpg"
      // unlinkFile strips leading "/" → "user/old-image-123.jpg"
      // path.join(cwd, 'uploads', 'user/old-image-123.jpg') → file delete হবে
      unlinkFile(user.profileImage);
    }

    // ✅ Step 4: payload-এ নতুন image path যোগ করো
    (payload as any).profileImage = newImagePath;
  }

  // ✅ Step 5: DB update
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  return updated;

};




// ADMIN : Get All Users

const getAllUsers = async (query: Record<string, unknown>) => {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10 
       const skip = (page - 1) * limit;


       const filter: Record<string, unknown> = {}

       if(query.role) filter.role = query.role
       if(query.search) {
        filter.$or = [
            {email: { 
                $regex: query.search, $options:  "i"
            }}
        ]
       }

       const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(limit).lean(),
        User.countDocuments(filter)
       ])


       return { users, meta: { page, limit, totalPages: Math.ceil(total/limit)}}
}




// Admin - Update User Status 
const updateUserStatus = async (userId: string, payload: UpdateUserStatusPayload ) => {

    const user = await User.findById(userId)
    if(!user || user.isDeleted) {
        throw new ApiError (StatusCodes.NOT_FOUND, 'User not found')
    } 

    user.status = payload.status as STATUS
    await user.save()

    return { message: `User status updated to ${payload.status}`}

}
export const UserService = {
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    updateUserStatus
}