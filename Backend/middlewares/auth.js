import Jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  // FIX: Check token exists
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  // FIX: Allow both "Bearer token" and plain token
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next(); // THIS NOW WORKS
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
