const express = require('express');
const replyControll = require('./replyController.js');

const router = express.Router();

router.get('/read', replyControll.readReply);

router.post('/create', replyControll.createReply);

router.get(
  '/edit',
  replyControll.checkLogin,
  replyControll.userCheck,
  replyControll.editGetReply
);

router.post('/edit', replyControll.editPostReply);

router.post(
  '/del',
  replyControll.checkLogin,
  replyControll.userCheck,
  replyControll.delReply
);

module.exports = router;
