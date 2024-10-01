const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Correct usage of template literals
        const uploadPath = `images/${req.user.id}`;

        // Check if the directory exists; if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Set the destination path
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate a unique file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9 );
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
