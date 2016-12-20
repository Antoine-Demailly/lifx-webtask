'use strict';

// Dependencies
const bodyparser = require('body-parser@1.12.4');
const Express    = require('express@4.14.0');
const unirest    = require('unirest@0.4.2');
const WebTask    = require('webtask-tools');

// Define express application
const app  = new Express();

// Lifx Model Instance => the model is at the bottom of the file (this a private token)
const lifx = new Lifx('c28effba772b0f2e5a0ce6e5c8bb68480568d72fdc4911a5a910e2b38c921f39');

// Config bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

/// Define some routes
///////

app.get('/', (req, res) => {
  res.send('Lifx Webtask - Code assignment');
});

app.get('/storage', (req, res) => {
  res.send(req.webtaskContext.storage);
});

app.post('/auth/:token', (req, res) => {
  req.webtaskContext.storage.token = req.params.token;

  res.send({
    isAuth: true,
  });
});

// Get the current state of the bulb
app.get('/state', (req, res) => {
  res.send('Bulb State: On');
});

// Power on / off the bulb (:state can be equal to "on" or "off")
app.put('/power/:state', (req, res) => {
  res.send({
    state: req.params.state,
    color: null
  });
});

// Change bulb color (automatically power on)
app.put('/color/:color', (req, res) => {
  res.send({
    power: 'on',
    color: req.params.color
  });
});

// Export application
module.exports = WebTask.fromExpress(app);

// Lifx Model
function Lifx(token) {
  let self = this;

  self.token = token;
}
