const express = require('express');
const router = express.Router();
const userController = require('./userController.js');

router.get('/join', userController.join);

router.post('/join', userController.joincheck);

router.get('/login', userController.login);

router.post('/login', userController.logincheck);

router.get('/logout', userController.logout);

router.get('/profile', userController.profile);

router.post('/profile', userController.profilecheck);

router.get('/quit', userController.quit);

router.get('/welcome', userController.welcome);

router.post('/join/idCheck', userController.idCheck);

module.exports = router;
