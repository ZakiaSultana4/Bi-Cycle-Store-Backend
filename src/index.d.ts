import { JwtPayload } from 'jsonwebtoken';

import { TTokenResponse } from './app/modules/Auth/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | TTokenResponse;
    }
  }
}