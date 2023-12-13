const express = require('express');
const moreinfoControll = require('./moreinfoController.js');

const router = express.Router();

router.get('/read', moreinfoControll.readMoreinfo);

router.post('/create', moreinfoControll.createMoreinfo);

router.get(
  '/edit',
  moreinfoControll.checkLogin,
  moreinfoControll.userCheck,
  moreinfoControll.editGetMoreinfo
);

router.post('/edit', moreinfoControll.editPostMoreinfo);

router.post(
  '/del',
  moreinfoControll.checkLogin,
  moreinfoControll.userCheck,
  moreinfoControll.delMoreinfo
);

module.exports = router;
