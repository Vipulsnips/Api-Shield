const { getUser } = require("../service/auth");

function checkForAuthentication(req, res, next) {
  const userUid = req.headers["authorization"];
  if (!userUid) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = userUid?.startsWith("Bearer ")? userUid.split("Bearer ")[1] : null ;
  const user = getUser(token);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  req.user = user;
  next();
}
function restrictTo(roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    if (!roles.includes(req.user.role)) return res.end("UnAuthorized");
    return next();
  };
}
module.exports = {
  checkForAuthentication,
  restrictTo,
};
