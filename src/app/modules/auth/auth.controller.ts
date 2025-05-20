import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authService } from './auth.service';
import { Request, Response } from 'express';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';


const login = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body,"test login data req.body")
  const result = await authService.login(req.body);
  const { refreshToken, accessToken } = result;

  // set refresh token in cookies
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendResponse(res, {
    success: true,
    message: 'Login successful',
    statusCode: StatusCodes.OK,
    data: {
      token: accessToken,
    },
  });
});

// register function
const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  const { _id, name, email } = result;
  sendResponse(res, {
    success: true,
    message: 'User created successfully',
    statusCode: StatusCodes.CREATED,
    data: { _id, name, email },
  });
});

// refresh token function
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken, res);
  // console.log(result,"controler result");
  sendResponse(res, {
    success: true,
    message: 'Login successful',
    statusCode: StatusCodes.OK,
    data: {
      token: result,
    },
  });
});

// update password function
const updatePassword = catchAsync(async (req, res) => {
  const user = req?.user;
  const payload = req.body;
  const result = await authService.updatePassword(user as JwtPayload, payload);
  // console.log(result,"controler result");
  sendResponse(res, {
    success: true,
    message: 'Update Password Successful',
    statusCode: StatusCodes.OK,
    data: {
      token: result,
    },
  });
});

// authMe function
// this function is used to get the authenticated user's information. The user must provide their userId in the request body. The request must include a valid access token in the Authorization header. If the user is authenticated successfully, their information is returned.
// The request must include a valid access token in the Authorization header. If the user is authenticated successfully, their information is returned.
// The user must provide their userId in the request body. The request must include a valid access token in the Authorization header. If the user is authenticated successfully, their information is returned.

const authMe = catchAsync(async (req, res) => {
 const userId = req?.user?.userId 
  const result = await authService.authMe(userId);
  sendResponse(res, {
    success: true,
    message: 'User Information getting successfully',
    statusCode: StatusCodes.OK,
    data: result
  });
});

// update profile
// this function is used to update the authenticated user's profile. The user must provide their userId and the updated profile information in the request body. The request must include a valid access token in the Authorization header. If the update is successful, a success message is returned with the updated profile information.
// The request must include a valid access token in the Authorization header. If the update is successful, a success message is returned with the updated profile information.
// The user must provide their userId and the updated profile information in the request body. The request must include a valid access token in the Authorization header. If the update is successful, a success message is returned with the updated profile information.

const profileUpdate = catchAsync(async (req, res) => {
  const userId = req?.user?.userId as string;
  const payload = req.body;
  const result = await authService.profileUpdate(userId, payload);
  sendResponse(res, {
    success: true,
    message: 'Update profile Successful',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

// logOut function
// this function is used to log out the user. The user must provide their refresh token in the request body. If the logout is successful, a success message is returned.
// The refresh token is sent in the request body, and if valid, the user is logged out, and a success message is returned.
// The refresh token is also removed from the cookies for security reasons.
// The response will include a success message indicating that the user has been logged out successfully.
// The refresh token is also removed from the cookies for security reasons.
// The response will include a success message indicating that the user has been logged out successfully.

const logOut = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  sendResponse(res, {
    success: true,
    message: 'Logout',
    statusCode: StatusCodes.OK,
    data: [],
  });
};

// block user function
// this function is used to block a user. The user must provide their userId and the payload containing the isBlocked status in the request body. The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.

const blockUser = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const body=req.body;

  const result= await authService.blockUser(userId,body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User blocked successfully',
    statusCode: StatusCodes.OK,
    data:result
  });
});

// get all users function
// this function is used to get all users. The user must provide the query parameters in the request body. The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
// The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.

const getUsers = catchAsync(async (req, res) => {
  const queryData = req?.query;

  const result = await authService.getUsers(queryData);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'All users get successfully',
    statusCode: StatusCodes.OK,
    data: result.result,
    meta:result.meta
  });
});


/**
 * Delete a user (Admin only)
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await authService.deleteUser(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

/**
 * Promote a user to Admin (Admin only)
 */
export const makeAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await authService.makeAdmin(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User promoted to admin successfully',
    data: result,
  });
});

export const authController = {
  register,
  login,
  refreshToken,
  updatePassword,
  logOut,
  profileUpdate,
  authMe,
  blockUser,
  getUsers,
    deleteUser,
  makeAdmin,
};