
const express = require('express');
const nunjucks = require('nunjucks');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const router = require('./routes/index.js');
const { logger } = require("./config/winston");

const PORT = process.env.PORT || 3001;

const sessionObj = {
  secret: 'kong',
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

app.use(express.urlencoded({ extended: true })); //post 요청 사용할때 header body로 오는 텍스트 읽어줌

app.use(router); //라우터 받는 파일

app.listen(PORT);

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${PORT}`);