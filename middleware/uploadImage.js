const multer = require('multer');
const path = require('path');

// Define the storage engine and destination for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file, 'what is inisde the file');
    // Change the path to your desired upload folder
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter the uploaded files to only accept certain file types (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create the multer middleware with the desired configuration
const upload = multer({ storage, fileFilter });

// console.log(upload);
module.exports = upload;
