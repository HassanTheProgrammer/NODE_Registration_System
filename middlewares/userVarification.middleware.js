const jwt = require("jsonwebtoken");

const userVarification = async (req, res, next) => {
  // Get the user id from jwt token and add in req object
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Please authenticate using a valid token",
    });
  }
  try {
    const encryptedID = jwt.verify(token, process.env.JWT_SIGNATURE);
    req.data = encryptedID;
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message:
        "Internal Server Error - Please authenticate using a valid token",
      error,
    });
  }
};

module.exports = userVarification;
