const express = require('express');
const infoboardController = require('./infoboardController.js');

const router = express.Router();

router.get('/list', infoboardController.listGetMid);

router.get('/view', infoboardController.viewGetMid);

router.get('/searchlist', infoboardController.search);

router.get('/search', infoboardController.search);

router.use('/', infoboardController.infoboardLoginCheck);

router.get('/write', infoboardController.writeGetMid);

router.post('/write', infoboardController.writePostMid);

router.get('/edit', infoboardController.infoboardUserCheck, infoboardController.editGetMid);

router.post('/edit', infoboardController.editPostMid);

router.get(
  '/delete',
  infoboardController.infoboardUserCheck,
  infoboardController.deleteGetMid
);

module.exports = router;
