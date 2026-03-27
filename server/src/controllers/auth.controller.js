const { User } = require("../models");
const { CustomException } = require("../utils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const satelize = require("satelize");
const { JWT_SECRET, NODE_ENV } = process.env;
const saltRounds = 10;

const cookieConfig = {
  httpOnly: true,
  sameSite: NODE_ENV === "production" ? "none" : "lax", // Use "lax" for development
  secure: NODE_ENV === "production", // Secure only in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

const authRegister = async (request, response) => {
  const { username, email, phone, password, image, isSeller, description } =
    request.body;
  const list =
    request.headers["x-forwarded-for"] || request.socket.remoteAddress;
  const ips = list.split(",");

  try {
    const hash = bcrypt.hashSync(password, saltRounds);

    const country = await new Promise((resolve, reject) => {
      satelize.satelize({ ip: ips[0] }, (error, payload) => {
        if (error) {
          console.error("Satelize error:", error.message);
          return resolve("Unknown");
        }
        resolve(payload?.country || "Unknown");
      });
    });

    const user = new User({
      username,
      email,
      password: hash,
      image,
      country,
      description,
      isSeller,
      phone,
    });

    await user.save();

    return response.status(201).send({
      error: false,
      message: "New user created!",
    });
  } catch ({ message }) {
    console.error("Register error:", message);

    if (message.includes("E11000")) {
      return response.status(400).send({
        error: true,
        message: "Choose a unique username!",
      });
    }

    return response.status(500).send({
      error: true,
      message: "Something went wrong!",
    });
  }
};

const authLogin = async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw CustomException("Check username or password!", 404);
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      throw CustomException("Check username or password!", 404);
    }

    const { password: _, ...data } = user._doc;

    const accessToken = jwt.sign(
      {
        _id: user._id,
        isSeller: user.isSeller,
      },
      JWT_SECRET,
      { expiresIn: "1d" } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Long-lived refresh token
    );

    // Set both tokens in cookies
    response.cookie("accessToken", accessToken, { ...cookieConfig, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    response.cookie("refreshToken", refreshToken, cookieConfig); // 7 days

    return response.status(202).send({
      error: false,
      message: "Success!",
      user: data,
    });
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

const authLogout = async (request, response) => {
  return response
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "none" : "strict",
      secure: NODE_ENV === "production",
      path: "/",
    })
    .status(200)
    .send({
      error: false,
      message: "User has been logged out!",
    });
};

const authStatus = async (request, response) => {
  try {
    const user = await User.findOne({ _id: request.userID }).select(
      "-password"
    );

    if (!user) {
      throw CustomException("User not found!", 404);
    }

    return response.send({
      error: false,
      message: "Success!",
      user,
    });
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

const refreshAccessToken = async (request, response) => {
  const { refreshToken } = request.cookies;

  try {
    if (!refreshToken) {
      throw CustomException("Refresh token missing!", 401);
    }

    const verification = jwt.verify(refreshToken, JWT_SECRET);
    const newAccessToken = jwt.sign(
      {
        _id: verification._id,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    response.cookie("accessToken", newAccessToken, cookieConfig);

    return response.status(200).send({
      error: false,
      message: "Access token refreshed!",
    });
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

// ✅ Exporting all functions
module.exports = {
  authRegister,
  authLogin,
  authLogout,
  authStatus,
  refreshAccessToken, // Export the new function
};
