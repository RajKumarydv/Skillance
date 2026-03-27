const express = require("express");
const {
  authLogin,
  authLogout,
  authRegister,
  authStatus,
} = require("../controllers/auth.controller");

const { authenticate } = require("../middlewares");

const router = express.Router();

// 🔒 Auth Routes
router.post("/register", authRegister);
router.post("/login", authLogin);
router.post("/logout", authLogout);
router.get("/me", authenticate, authStatus);

module.exports = router;
