const express = require("express");
const { restrictTo, checkForAuthentication } = require("../middlewares/auth");
const {
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require("../controllers/auth");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.post("/signup", asyncHandler(signupUser));
router.post("/login", asyncHandler(loginUser));
router.post("/logout", asyncHandler(logoutUser));
router.get("/me", checkForAuthentication, asyncHandler(getCurrentUser));

module.exports = router;
