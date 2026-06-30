// ============================================================
// middleware/optionalProtect.ts
// Unlike "protect" (which BLOCKS the request if no valid token exists),
// this middleware tries to identify the user IF a token is present,
// but always allows the request to continue — even for guests.
//
// This is exactly what we need for placing orders:
// - If logged in → attach req.user so the order gets linked to their account
// - If guest → just continue, no error, order is placed without a userId
// ============================================================

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest, IJwtPayload } from "../types/indexServer";

export const optionalProtect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // Only attempt to decode if an Authorization header is actually present
    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1];

      // Verify the token's signature and decode the payload
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as IJwtPayload;

      // Look up the user in the database (excluding password)
      const user = await User.findById(decoded.id).select("-password");

      // If the user exists, attach them to the request
      // Controllers can now check `req.user` to see if someone is logged in
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // IMPORTANT: We swallow the error here on purpose.
    // An invalid or expired token should NOT block a guest checkout —
    // it should just mean the order proceeds without a linked account.
    console.log("optionalProtect: no valid token, continuing as guest");
  }

  // Always continue to the next middleware/controller,
  // regardless of whether a user was found or not
  next();
};
