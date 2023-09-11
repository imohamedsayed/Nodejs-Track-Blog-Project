const fs = require("fs");
const path = require("path");

const deleteImages = (images) => {
  images.forEach((image) => {
    fs.unlinkSync(path.join(__dirname, "../uploads/" + image));
  });
};
const getFilesPaths = (files) => {
  const imgPaths = [];
  var ERROR_Flag = false;
  files.forEach((file) => {
    let pathImg = file.path.substring(file.path.lastIndexOf("\\images") + 1);
    if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
      imgPaths.push(pathImg);
    } else {
      fs.unlinkSync(path.join(__dirname, "../uploads/" + pathImg));
      ERROR_Flag = true;
    }
  });
  if (ERROR_Flag) {
    if (imgPaths.length > 0) {
      imgPaths.forEach((image) => {
        fs.unlinkSync(path.join(__dirname, "../uploads/" + image));
      });
    }
    return null;
  } else {
    return imgPaths;
  }
};

const deleteImage = (image) => {
  fs.unlinkSync(path.join(__dirname, "../uploads/" + image));
};

const getImage = (file) => {
  let name = file.path.substring(file.path.lastIndexOf("\\images") + 1);
  if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
    return name;
  } else {
    fs.unlinkSync(path.join(__dirname, "../uploads/" + name));
    return null;
  }
};

module.exports = {
  deleteImages,
  deleteImage,
  getFilesPaths,
  getImage,
};
