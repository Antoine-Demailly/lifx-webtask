'use strict';

// Dependencies
const _          = require('lodash@4.8.2');
const bodyparser = require('body-parser@1.12.4');
const Express    = require('express@4.14.0');
const unirest    = require('unirest@0.4.2');
const WebTask    = require('webtask-tools');

// Define express application
const app  = new Express();

// Config bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

/// Define some routes
///////

app.get('/', (req, res) => {
  res.send('Welcome to Lifx Webtask');
});

// Auth route, just pass your private token in route parameters
app.post('/auth/:token', (req, res) => {
  req.webtaskContext.storage.set({token: req.params.token}, {force: 1}, (err) => {
    if (err) {
      res.status(400).send({
        error: true,
        message: 'Error during authentication'
      });
      return;
    }

    res.send({
      error: false,
      message: 'Token is set',
    });
  });
});

// Protect next routes with authMiddleware
app.use(authMiddleware);

// Get the current state of the bulb
app.get('/state', (req, res) => {
  let lifx = new Lifx(req.lifxToken);

  lifx.getState()
    .then((data) => res.send(data))
    .catch((err) => res.status(400).send(err));
});

// Get available states
app.get('/states', (req, res) => {
  let lifx = new Lifx(req.lifxToken);

  res.send({
    error: false,
    message: 'List of available states',
    states: lifx.getAvailableStates()
  });
});

// Get available colors
app.get('/colors', (req, res) => {
  let lifx = new Lifx(req.lifxToken);

  res.send({
    error: false,
    message: 'List of available colors',
    colors: lifx.getAvailableColors()
  });
});

// Power on / off the bulb (:state can be equal to "on" or "off")
app.put('/power/:state', (req, res) => {
  let lifx = new Lifx(req.lifxToken);

  lifx.changeState(req.params.state)
    .then((data) => res.send(data))
    .catch((err) => res.status(400).send(err));
});

// Change bulb color (automatically power on)
app.put('/color/:color', (req, res) => {
  let lifx = new Lifx(req.lifxToken);

  lifx.changeColor(req.params.color)
    .then((data) => res.send(data))
    .catch((err) => res.status(400).send(err));
});

// Export application
module.exports = WebTask.fromExpress(app);

// authMiddleware
function authMiddleware(req, res, next) {
  req.webtaskContext.storage.get(function(err, data) {
    if (err || _.isUndefined(data) || _.isUndefined(data.token)) {
      res.status(403).send({
        error: true,
        message: 'Access denied: Please set a token in a valid format',
      });

      return;
    }

    req.lifxToken = data.token;
    next();
  });
}

// Lifx Model
function Lifx(token) {
  token = _.isUndefined(token) ? '' : token;

  /// Attributes
  ///////

  let colors  = ['white', 'red', 'orange', 'yellow', 'cyan', 'green', 'blue', 'purple', 'pink'];
  let headers = {
    Authorization: 'Bearer ' + token
  };

  let states  = ['on', 'off'];

  let getEndpoint = 'https://api.lifx.com/v1/lights/all';
  let putEndpoint = 'https://api.lifx.com/v1/lights/all/state';

  /// Public Methods
  ///////

  this.changeColor        = changeColor;
  this.changeState        = changeState;
  this.getAvailableColors = getAvailableColors;
  this.getAvailableStates = getAvailableStates;
  this.getState           = getState;

  function changeColor(color) {
    let data = {error: false, message: 'Color is set to ' + color};

    return new Promise((resolve, reject) => {
      if (isValidColor(color)) {

        unirest.put(putEndpoint)
          .headers(headers)
          .send({power: 'on', color: color})
          .end((response) => {
            if (response.body.error) {
              data.error = true;
              data.message = response.body.error;
              reject(data);
            } else {
              resolve(data);
            }
          });

      } else {
        data.error = true;
        data.message = 'This is an invalid color';
        reject(data);
      }
    });
  }

  function changeState(state) {
    let data = {error: false, message: 'Power is ' + state};

    return new Promise((resolve, reject) => {
      if (isValidState(state)) {

        unirest.put(putEndpoint)
          .headers(headers)
          .send({power: state})
          .end((response) => {
            if (response.body.error) {
              data.error = true;
              data.message = response.body.error;
              reject(data);
            } else {
              resolve(data);
            }
          });

      } else {
        data.error = true;
        data.message = 'This is an invalid state';
        reject(data);
      }
    });
  }

  function getAvailableColors() {
    return colors;
  }

  function getAvailableStates() {
    return states;
  }

  function getState() {
    let data = {error: false};

    return new Promise((resolve, reject) => {
      unirest.get(getEndpoint)
        .headers(headers)
        .end((response) => {
          let body = response.body;

          if (_.isObject(body) && body.error) {
            data.error = true;
            data.message = body.error;
            reject(data);
          } else {
            data.power = body[0].power;
            data.color = body[0].color;
            resolve(data);
          }
        });
    });
  }

  /// Private Methods
  function isValidColor(color) {
    return _.isString(color) && _.includes(colors, color);
  }

  function isValidState(state) {
    return _.isString(state) && _.includes(states, state);
  }
}
