const express = require('express');
const router = new express.Router();
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});
router.post('/sign-up', (req, res, next) => {
  const { username, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((hashAndSalt) => {
      return User.create({
        username: username,
        passwordHashAndSalt: hashAndSalt
      });
    })
    .then((user) => {
      req.session.user = user;
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const { username, password } = req.body;
  let user;
  User.findOne({ username })
    .then((userDocument) => {
      user = userDocument;
      if (user) {
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      } else {
        return false;
      }
    })
    .then((result) => {
      if (result) {
        req.session.user = user;
        res.redirect('/');
      } else {
        res.redirect('/log-in');
      }
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
