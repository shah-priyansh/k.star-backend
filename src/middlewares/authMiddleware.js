// authMiddleware.js

const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const jwtSecretKey = process.env.JWT_SECRET_KEY || "default_secret_key";

async function checkTokenMiddleware(req, res, next) {
  const providedToken = req.headers.authorization;

  if (!providedToken || !providedToken.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Missing or malformed token" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(providedToken.split(" ")[1], jwtSecretKey);

    // Attach the decoded user information to the request object
    req.user = { userId: decoded.userId };

    // Log the decoded token information
    console.log("Decoded User Information:", decoded);

    // Include the decoded token information in the response
    const decodedToken = {
      userId: decoded.userId,
      objectId: new ObjectId(decoded.userId), // Assuming you have ObjectId imported
      iat: decoded.iat,
      exp: decoded.exp,
    };

    res.locals.decodedToken = decodedToken;

    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
}

module.exports = { checkTokenMiddleware };
