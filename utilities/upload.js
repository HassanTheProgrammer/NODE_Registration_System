const multer = require("multer");
const fs = require("fs");
const path = require("path");

/**
 * Storage
 */
const storage = multer.diskStorage({
  /**
   * Check, Create and Return Destination Path
   */
  destination: (req, file, cb) => {
    // if(!fs.existsSync("public")){
    //     fs.mkdirSync("public");
    // }
    fs?.existsSync("public") ?? fs?.mkdirSync("public");

    // if (!fs.existsSync("public/profileImages")) {
    //   fs.mkdirSync("public/profileImages");
    // }
    fs?.existsSync("public/profileImages") ??
      fs?.mkdirSync("public/profileImages");

    cb(null, "public/profileImages");
  },

  /**
   * File Name
   */
  filename: (req, file, cb) => {
    cb(null, file.originalname + Date.now());
  },
});

/**
 * Filefilter
 */
const fileFilter = (req, file, cb) => {
  const fileExtenstion = path?.extname(file?.originalname);

  return fileExtenstion !== ".jpg" &&
    fileExtenstion !== ".jpeg" &&
    fileExtenstion !== ".png"
    ? cb?.(new Error("Only jpg, jpeg and png files are allowed"))
    : cb?.(null, true);
};

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  //   limits : { fileSize: 100000 }
});
