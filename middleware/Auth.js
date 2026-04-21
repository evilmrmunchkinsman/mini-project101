import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    // 🔹 1. Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    // 🔹 2. Extract token (Bearer TOKEN)
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Invalid token format"
      });
    }

    // 🔹 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 4. Attach user info to request
    req.user = decoded;

    // 🔹 5. Continue to next middleware / route
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
};

export default auth;