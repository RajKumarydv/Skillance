const jwt = require("jsonwebtoken");
const { CustomException } = require("../utils");

const userMiddleware = (request, response, next) => {
  const token = request.cookies.accessToken;

  try {
    if (!token) {
      throw CustomException("Session expired", 401);
    }

    const verification = jwt.verify(token, process.env.JWT_SECRET);
    request.userID = verification._id;
    request.isSeller = verification.isSeller;
    next();
  } catch (err) {
    return response.status(err.status || 401).json({
      error: true,
      message: err.message || "Session expired",
    });
  }
};

module.exports = userMiddleware;
