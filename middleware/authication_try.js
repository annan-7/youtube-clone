// Middleware: authMiddleware.js
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
const authMiddleware = asyncHandler((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = User.findById(decoded?._id).select("-password -refreshToken")
   .lean(); // Return plain JS object instead of Mongoose document
   if(!user){
      return res.status(401).json({error: "Unauthorized"})
   }
    req.user = user; // Attach user to request
    next(); // Proceed to route handler
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

export default authMiddleware;