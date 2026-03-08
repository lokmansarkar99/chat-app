import { z } from 'zod';
import { USER_ROLES, STATUS } from '../../../enums/user';
import { checkValidID } from '../../../shared/chackValid';

// ── Update my profile ──────────────────────────────
const updateMyProfileSchema = z.object({
  body: z.object({
    name:  z.string().min(3, 'Name must be at least 3 characters').optional(),
    email: z.string().email('Invalid email').optional(),
    // profileImage comes from multer → file, NOT body
  }),
});

// ── Admin: change user status ──────────────────────
const updateUserStatusSchema = z.object({
  params: z.object({
    id: checkValidID('Invalid user ID'),
  }),
  body: z.object({
    status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE], {
      message: 'Status must be ACTIVE or INACTIVE',
    }),
  }),
});

// ── Admin: get user by id ──────────────────────────
const getUserByIdSchema = z.object({
  params: z.object({
    id: checkValidID('Invalid user ID'),
  }),
});

export const UserValidation = {
  updateMyProfileSchema,
  updateUserStatusSchema,
  getUserByIdSchema,
  
};

// Payload types
export type UpdateMyProfilePayload = z.infer<typeof updateMyProfileSchema>['body'];
export type UpdateUserStatusPayload = z.infer<typeof updateUserStatusSchema>['body'];
