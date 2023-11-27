const mongoose = require("mongoose");
require("dotenv").config();

const URI = process.env.MONGO_URI;

URI
  ? mongoose
      .connect(URI)
      .then(() => console.log("==> MONGO DB CONNECTED SUCCESSFULLY."))
      .catch((error) =>
        console.error(`==> ERROR IN MONGO DB CONNECTION\n${error}`)
      )
  : console.log(
      "==> First set MONGO_URI in .env and also explore README.md file"
    );
