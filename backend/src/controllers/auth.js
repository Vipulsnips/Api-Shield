const User = require("../models/users");
const { setUser } = require("../service/auth");

async function signupUser(req, res, next) {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    return next(error);
  }
  const user = await User.create({
    name,
    email,
    password,
  });
  const token = setUser(user);
  return res.status(201).json({
    token,
  });
}
async function loginUser(req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    return next(error);
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    return next(error);
  }
  const token = setUser(user);
  return res.json({
    token,
  });
}
function logoutUser(req, res) {
  return res.json({
    message: "Logout on client side",
  });
}
function getCurrentUser(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
