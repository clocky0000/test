const express = require('express');
const rereplyControll = require('./rereplyController.js');

const router = express.Router();

router.get('/read', rereplyControll.readRereply);

router.post('/create', rereplyControll.createRereply);

router.get(
  '/edit',
  rereplyControll.checkLogin,
  rereplyControll.userCheck,
  rereplyControll.editGetRereply
);

router.post('/edit', rereplyControll.editPostRereply);

router.post(
  '/del',
  rereplyControll.checkLogin,
  rereplyControll.userCheck,
  rereplyControll.delRereply
);

module.exports = router;
