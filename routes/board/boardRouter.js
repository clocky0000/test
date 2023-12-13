const express = require('express');
const boardController = require('./boardController.js');

const router = express.Router();

router.get('/list', boardController.listGetMid);

router.get('/view', boardController.viewGetMid);

router.get('/searchlist', boardController.search);

router.get('/search', boardController.search);

router.use('/', boardController.boardLoginCheck);

router.get('/write', boardController.writeGetMid);

router.post('/write', boardController.writePostMid);

router.get('/edit', boardController.boardUserCheck, boardController.editGetMid);

router.post('/edit', boardController.editPostMid);

router.get(
  '/delete',
  boardController.boardUserCheck,
  boardController.deleteGetMid
);

module.exports = router;
