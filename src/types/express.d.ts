
import { ShopJwtPayload, UserJwtPayload } from "../middleware/authGuard";

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
      shop?: ShopJwtPayload;
    }
  }
}
