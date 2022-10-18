'use strict';

const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const serveFavicon = require('serve-favicon');
const mongoose = require('mongoose');
const baseRouter = require('./routes/base');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(serveFavicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: 'ertaersaertsaersert',
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    },
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24
    })
  })
);

app.use('/', baseRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});

const { NODE_ENV, PORT, MONGODB_URI } = process.env;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`Database connected to URI "${MONGODB_URI}"`);
    app
      .listen(Number(PORT), () => {
        console.log(`Server listening to requests on port ${PORT}`);
        if (NODE_ENV === 'development') {
          console.log(`Visit http://localhost:${PORT} to develop your app`);
        }
      })
      .on('error', (error) => {
        console.log('There was a server error.', error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.log(
      `There was an error connecting to the database "${MONGODB_URI}"`,
      error
    );
  });
