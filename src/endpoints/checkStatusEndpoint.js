const { Router } = require('express');

const statusRouter = new Router();

statusRouter.get('/status', async (req, res) => {
	res.status(200).send('ok');
});

module.exports = { statusRouter };
