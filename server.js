const express = require('./config/express.js');
const { logger } = require('./config/winston.js');

const port = 3001;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);