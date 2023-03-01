function waitUntilTrue(booleanFn) {
	return new Promise((resolve) => {
		const checkInterval = setInterval(() => {
			if (booleanFn()) {
				clearInterval(checkInterval);
				resolve();
			}
		}, 100);
	});
}

module.exports = { waitUntilTrue };
