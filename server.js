
const express = require('express');
const nunjucks = require('nunjucks');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const router = require('./routes/index.js');
const { logger } = require("./config/winston");
const secret = require("./config/secret");

const PORT = process.env.PORT || 3001;

const sessionObj = {
  secret: secret.session,
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({ checkPeriod: 1000 * 60 * 5 }),
  cookie: {
    maxAge: 1000 * 60 * 5,
  },
};

const app = express();

app.set('view engine', 'html');
nunjucks.configure('views', { express: app });

app.use(express.static('public'));

app.use(session(sessionObj));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(router);

app.listen(PORT);

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${PORT}`);