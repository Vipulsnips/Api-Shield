const express = require("express");
const { restrictTo,checkForAuthentication } = require("../middlewares/auth");
const {
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me",checkForAuthentication, getCurrentUser);

module.exports = router;
