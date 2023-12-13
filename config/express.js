const express = require('express');
const nunjucks = require('nunjucks');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const router = require('../routes/index');
const { logger } = require("./winston");
const secret = require("./secret");

const sessionObj = {
  secret: secret.session,
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({ checkPeriod: 1000 * 60 * 5 }),
  cookie: {
    maxAge: 1000 * 60 * 5,
  },
};

module.exports = function () {

const app = express();

app.set('view engine', 'html');

nunjucks.configure('views', { express: app });

app.use(express.static('public'));

app.use(session(sessionObj));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(router);

return app;

};
