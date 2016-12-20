'use strict';

// Dependencies
const _          = require('lodash@4.8.2');
const bodyparser = require('body-parser@1.12.4');
const Express    = require('express@4.14.0');
const unirest    = require('unirest@0.4.2');
const WebTask    = require('webtask-tools');

// Define express application
const app  = new Express();

// Lifx Model Instance => the model is at the bottom of the file
const lifx = new Lifx();

// Config bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

/// Define some routes
///////

app.get('/', (req, res) => {
  if (lifx.isAuth()) {
    res.send('Lifx Webtask: Config OK');
  } else {
    res.send('Lifx Webtask: Please set your private token on /auth/:token');
  }
});

app.post('/auth/:token', (req, res) => {
  lifx.setToken(req.params.token, (err, message) => {
    let code = err ? 400 : 200;

    res.status(code).send({
      error: err,
      message: message
    });
  });
});

// Get the current state of the bulb
app.get('/state', authMiddleware, (req, res) => {
  res.send('Bulb State: On');
});

// Power on / off the bulb (:state can be equal to "on" or "off")
app.put('/power/:state', authMiddleware, (req, res) => {
  res.send({
    state: req.params.state,
    color: null
  });
});

// Change bulb color (automatically power on)
app.put('/color/:color', authMiddleware, (req, res) => {
  res.send({
    power: 'on',
    color: req.params.color
  });
});

// Export application
module.exports = WebTask.fromExpress(app);

// authMiddleware
function authMiddleware(req, res, next) {
  if (lifx.isAuth()) {
    next();
  } else {
    res.status(400).send({
      error: true,
      message: 'Invalid token'
    });
  }
}

// Lifx Model
function Lifx() {

  /// Attributes
  ///////

  let auth    = false;
  let colors  = ['white', 'red', 'orange', 'yellow', 'cyan', 'green', 'blue', 'purple', 'pink'];
  let headers = {};
  let states  = ['on', 'off'];

  /// Public Methods
  ///////

  this.isAuth       = isAuth;
  this.isValidColor = isValidColor;
  this.isValidState = isValidState;
  this.setToken     = setToken;

  function isAuth() {
    return auth;
  }

  function isValidColor(color) {
    return _.includes(colors, color);
  }

  function isValidState(state) {
    return _.includes(states, state);
  }

  function setToken(token, callback) {
    if (typeof token == 'string' && token.length == 64) {
      headers.Authorization = 'Bearer ' + token;
      auth = true;

      callback(false, 'Token is set');
    } else {
      callback(true, 'Invalid Token Format');
    }
  }

}
