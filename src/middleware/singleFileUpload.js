const multer = require('multer');

const FILE_FIELD_KEY = 'file';

const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = {
	singleFileUploadMiddleWare: upload.single(FILE_FIELD_KEY),
	FILE_FIELD_KEY,
};
