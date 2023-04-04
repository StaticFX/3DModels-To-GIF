const fs = require('fs');

/**
 * creates a given directories if it does not exits
 * @param  {...string} dirPaths paths to check and create if necessary
 */
function createDirSync(...dirPaths) {
	dirPaths.forEach((dirPath) => {
		if (!fs.existsSync(dirPath)) {
			try {
				fs.mkdirSync(dirPath, { recursive: true });
				console.debug(`Created directory: ${dirPath}`);
			} catch (err) {
				console.debug(`Failed to create directory: ${dirPath}: ${err}`);
			}
		} else {
			console.debug(`Directory already exists: ${dirPath}`);
		}
	});
}

module.exports = {
	createDirSync,
};
