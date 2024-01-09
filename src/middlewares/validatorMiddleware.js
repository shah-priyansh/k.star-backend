const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';

async function validateToken(req, res, next) {
  try {
    // Get the token from the request headers
    const providedToken = req.headers.authorization;

    if (!providedToken || !providedToken.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - Missing or malformed token' });
    }

    // Extract the token from the "Bearer" prefix
    const token = providedToken.split(' ')[1];

    // Verify the token
    jwt.verify(token, jwtSecretKey, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(404).json({ message: 'Not Found - Token has expired', error: 'TokenExpiredError' });
        }
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }

      // Attach the decoded user information to the request object for further use in the routes
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error in validateToken middleware:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { validateToken };