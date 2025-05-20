export const USER_ROLE = {
    // user: 'user',
    admin: 'admin',
    customer: 'customer',
  } as const;
export type TUserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
  export type TTokenResponse = {
    name: string,
    email: string,
    role: string,
    userId: string,
    iat: number,
    exp: number,
  };