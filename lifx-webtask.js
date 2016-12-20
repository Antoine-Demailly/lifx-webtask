'use strict';

// Dependencies
const bodyparser = require('body-parser@1.12.4');
const Express    = require('express@4.14.0');
const unirest    = require('unirest@0.4.2');
const WebTask    = require('webtask-tools');

// Define express application
const app = new Express();

// Config bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// Define routes
app.get('/', (req, res) => {
  res.send('Lifx Webtask - Code assignment');
});

app.get('/state', (req, res) => {
  res.send('Bulb State: On');
});

app.put('/power/:state', (req, res) => {
  res.send(req.params.state);
});

app.put('/color/:color', (req, res) => {
  res.send(req.params.color);
});

module.exports = WebTask.fromExpress(app);
