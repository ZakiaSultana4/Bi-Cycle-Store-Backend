/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';

import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import config from '../../config';
import { createToken } from './auth.utills';
import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { createHashPassword } from '../../utils/createHashPassword';
import { comparePassword } from '../../utils/comparePassword';
import { IUser } from './user.interface';
import User from './auth.model';
import QueryBuilder from '../../builder/queryBuilder';
import ApiError from '../../errors/ApiError';

type UserPayload = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

// register function------✓✓
const register = async (payload: IUser): Promise<UserPayload> => {
  const result = await User.create(payload);

  return result;
};

// login function------✓✓
const login = async (payload: { email: string; password: string }) => {
  // checking if the user is exist in database
  const user = await User.findOne({ email: payload?.email }).select(
    '+password',
  );

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  // //checking if the password is correct
  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Wrong Password !!');
  }
  // // checking if the user is inactive
  const userStatus = user?.isBlocked;

  if (userStatus) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
  }

  //create token and sent to the  client side
  const jwtPayload = {
    name: user?.name,
    email: user?.email,
    role: user?.role,
    userId: user?._id,
  };

  // const accessToken 
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  // const refreshToken 
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken, user };
};

// refreshToken 
const refreshToken = async (token: string, res: Response) => {
  let decoded;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_refresh_secret as string,
    ) as JwtPayload;
    // console.log(decoded, 'decoded');
  } catch (error) {
    res.clearCookie('refreshToken');
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Expired refresh token');
  }

  const { userId } = decoded;
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // // checking if the user is inactive
  const userStatus = user?.isBlocked;

  if (userStatus) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
  }
  //create token and sent to the  client side
  const jwtPayload = {
    email: user?.email,
    role: user?.role,
    userId: user?._id,
  };

  // const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, { expiresIn: config.jwt_access_expires_in as string });
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  return accessToken;
};

// update password function-------✓✓
const updatePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const { userId, email, role } = userData;
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const isPasswordMatched = await comparePassword(
    payload?.oldPassword,
    user?.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Please enter current password correctly',
    );
  }
  const newPassword = await createHashPassword(
    payload?.newPassword,
    config.bcrypt_salt_round as string,
  );

  await User.findByIdAndUpdate(userId, {
    password: newPassword,
  });
};

// update profile function-------✓✓
const profileUpdate = async (
  userId: string,
  payload: Record<string, unknown>,
) => {
  const result = await User.findByIdAndUpdate(userId, payload, { new: true });
  return result;
};

// get user information function-------✓✓
const authMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  return user;
};




// block user function-------✓✓
// this function is used to block a user. The user must provide their userId and the payload containing the isBlocked status in the request body. The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.

const blockUser = async (
    userId: string,
    payload:{isBlocked: boolean}
  ) => {
    // check blog id from database
    const checkUser = await User.findById(userId);
    // console.log(checkUser)
    // if blog id not fount it show a error
    if (checkUser?.role === 'admin') {
      throw new AppError(StatusCodes.NOT_FOUND, 'Admin not will be blocked');
    }
    // // update blog id from database
    const updateBlog = await User.findByIdAndUpdate(userId, payload, {
      new: true,
    });
    // // if blog not updated it show a error
    if (!updateBlog) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'user not blocked! try again later');
    }
   
  };


// get all users function-------✓✓
// this function is used to get all users. The user must provide the query parameters in the request body. The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
// The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
  const getUsers = async (query: Record<string, unknown>) => {
    const searchableFields = ['name'];
    const bikeQuery = new QueryBuilder(User.find(), query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();
  
      const result = await bikeQuery.modelQuery;
      const meta = await bikeQuery.countTotal();
      return {
        meta,
        result,
      };
  };

const deleteUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  await User.findByIdAndDelete(userId);
  return { message: 'User has been deleted' };
};

/**
 * Promote a user to Admin
 */
// In auth.service.ts or user.service.ts
export const makeAdmin = async (userId: string) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role: 'admin' },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return updatedUser;
};


export const authService = {
  register,
  login,
  refreshToken,
  updatePassword,
  profileUpdate,
  authMe,
  blockUser,
  getUsers,
  deleteUser,
  makeAdmin,
};