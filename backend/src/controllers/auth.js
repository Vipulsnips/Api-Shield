const User = require("../models/users");
const { setUser } = require("../service/auth");

async function signupUser(req, res) {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    const token = setUser(user);
    return res.status(201).json({
      token,
    });
  } catch (err) {
    if (err === 11000) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      const token = setUser(user);
      return res.json({
        token,
      });
    }
  } catch {
    return res.redirect("/login");
  }
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
