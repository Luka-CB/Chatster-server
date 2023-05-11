const cloudinary = require("../config/cloudinary");

const uploadImage = async (image, folderName) => {
  const result = await cloudinary.uploader.unsigned_upload(image, "chat-app", {
    folder: `chat-app/${folderName}`,
  });

  return result;
};

const removeImage = async (public_id) => {
  const result = await cloudinary.uploader.destroy(public_id);
  return result;
};

module.exports = {
  uploadImage,
  removeImage,
};
