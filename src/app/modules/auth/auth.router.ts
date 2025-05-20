import { Router } from 'express';

import { authController } from './auth.controller';
import { authValidation } from './auth.validation';

import { USER_ROLE } from './auth.interface';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { userValidation } from './user.validation';

const authRouter = Router();

// auth me route------✓✓--- Need access token from Header 
// this route is used to get the authenticated user's information. The request must include a valid access token in the Authorization header. If the token is valid, the user's information is returned in the response. If the token is invalid or expired, an error message is returned.
// The request must include a valid access token in the Authorization header. If the token is valid, the user's information is returned in the response. If the token is invalid or expired, an error message is returned.
// The request must include a valid access token in the Authorization header. If the token is valid, the user's information is returned in the response. If the token is invalid or expired, an error message is returned.

authRouter.get(
  '/me',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  authController.authMe,
);

// create user route------✓✓
// this route is used to create a new user. The user must provide their name, email, password, and role in the request body. The request must include a valid access token in the Authorization header. If the user is created successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is created successfully, a success message is returned.
// The user must provide their name, email, password, and role in the request body. The request must include a valid access token in the Authorization header. If the user is created successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is created successfully, a success message is returned.
// The user must provide their name, email, password, and role in the request body. The request must include a valid access token in the Authorization header. If the user is created successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is created successfully, a success message is returned.

authRouter.post(
  '/register',
    validateRequest(userValidation.userValidationSchema),
  authController.register,
);

// login route--------✓✓
// this route is used to log in a user. The user must provide their email and password in the request body. If the login is successful, an access token and refresh token are generated and returned in the response. The access token is used for authentication in subsequent requests, while the refresh token is used to obtain a new access token when the current one expires.
// The refresh token is also set in the cookies for future use. The response will include the access token and refresh token in the response body.
// The refresh token is also set in the cookies for future use. The response will include the access token and refresh token in the response body.

authRouter.post(
  '/login',
validateRequest(authValidation.loginValidationSchema),
  authController.login,
);

// refresh token route--------✓✓
// Content-Type: application/json
// Cookie: refreshToken=your_refresh_token_here---automatically added by the browser
// This route is used to refresh the access token using the refresh token stored in cookies.
// The refresh token is sent in the request cookies, and if valid, a new access token is generated and returned in the response.
// The refresh token is also set in the cookies again for future use.
// The response will include the new access token in the response body.
// The refresh token is sent in the request cookies, and if valid, a new access token is generated and returned in the response.
// The refresh token is also set in the cookies again for future use.
// The response will include the new access token in the response body.
authRouter.post(
  '/refresh-token',
  validateRequest(authValidation.refreshTokenValidationSchema),
  authController.refreshToken,
);

// update password route--------✓✓--- Need access token from Header
// this route is used to update the password of the authenticated user. The user must provide their old password and the new password in the request body. The request must include a valid access token in the Authorization header. If the old password is correct, the password is updated, and a success message is returned.
// The request must include a valid access token in the Authorization header. If the old password is correct, the password is updated, and a success message is returned.

authRouter.patch(
  '/update-password',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  validateRequest(authValidation.updatePasswordValidationSchema),
  authController.updatePassword,
);

// ↦↦ update profile route--------✓✓--- Need access token from Header
// this route is used to update the profile of the authenticated user. The user must provide their updated profile information in the request body. The request must include a valid access token in the Authorization header. If the update is successful, a success message is returned.
// The request must include a valid access token in the Authorization header. If the update is successful, a success message is returned.

authRouter.patch(
  '/update-profile',
  auth(USER_ROLE.customer, USER_ROLE.admin),
  authController.profileUpdate,
);

// ↦↦ logout route
// this route is used to log out the user. The user must provide their refresh token in the request body. If the logout is successful, a success message is returned.
// The refresh token is sent in the request body, and if valid, the user is logged out, and a success message is returned.
// The refresh token is also removed from the cookies for security reasons.
// The response will include a success message indicating that the user has been logged out successfully.
// The refresh token is also removed from the cookies for security reasons.
// The response will include a success message indicating that the user has been logged out successfully.
authRouter.post('/logout', authController.logOut);

// ↦↦ block user route--------✓✓--- Need access token from Header
// this route is used to block a user. The user must provide their userId and the payload containing the isBlocked status in the request body. The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.
// The user must provide their userId and the payload containing the isBlocked status in the request body. The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.
// The request must include a valid access token in the Authorization header. If the user is blocked successfully, a success message is returned.
authRouter.patch(
  '/users/:userId/block',
  auth(USER_ROLE.admin),
authController.blockUser
);

// ↦↦ get all users route--------✓✓--- Need access token from Header
// this route is used to get all users. The user must provide the query parameters in the request body. The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
// The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
// The user must provide the query parameters in the request body. The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
// The request must include a valid access token in the Authorization header. If the users are retrieved successfully, a success message is returned with the list of users.
authRouter.get(
  '/all-users',
  auth(USER_ROLE.admin),
  authController.getUsers
);

/**
 * @route DELETE /users/:userId
 * @desc Delete a specific user (admin only)
 * @access Admin
 */
authRouter.delete(
  '/users/:userId',
  auth(USER_ROLE.admin),
  authController.deleteUser
);

/**
 * @route PATCH /users/:userId/make-admin
 * @desc Promote a specific user to admin role
 * @access Admin
 */
authRouter.patch(
  '/users/:userId/make-admin',
  auth(USER_ROLE.admin),
  authController.makeAdmin
);


export default authRouter;