const express = require('express');
const userRouter = require('./user/userRouter.js');
const boardRouter = require('./board/boardRouter.js');
const infoboardRouter = require('./infoboard/infoboardRouter.js');
const replyRouter = require('./reply/replyRouter.js');
const rereplyRouter = require('./rereply/rereplyRouter.js');
const moreinfoRouter = require('./moreinfo/moreinfoRouter.js');

const router = express.Router();

router.use('/board', boardRouter);
router.use('/infoboard',infoboardRouter);
router.use('/user', userRouter);
router.use('/reply',replyRouter);
router.use('/rereply',rereplyRouter);
router.use('/moreinfo',moreinfoRouter);

router.get('/', (req, res) => {
  const main = 1;
  const { user } = req.session;
  if (user !== undefined) {
    res.render('index.html', { user, main });
  } else {
    res.render('index.html');
  }
});

module.exports = router;
