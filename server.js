/**
 * CommonJS Syntax to import modules
 */
const express = require("express");
const app = express();
const router = require("./routes/User.routes");

require("dotenv").config();
require("./config/db.config");

/**
 * Middleware
 */
app.use(express.json());
app.use("/api/v1", router);

/**
 * Run Server
 */
app.listen(process.env.PORT, () =>
  console.log(`==> SERVER IS RUNNING ON PORT ${process.env.PORT}`)
);
