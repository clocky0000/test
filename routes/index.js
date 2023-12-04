const express = require('express');
const userRouter = require('./user/userRouter.js');

const router = express.Router();

router.use('/user', userRouter);

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
