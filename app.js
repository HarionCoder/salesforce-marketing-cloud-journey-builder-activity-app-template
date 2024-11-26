'use strict';
// Module Dependencies
// -------------------
const { ServerConfig } = require("./bin/config");
const morgan = require("morgan");
const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const http = require('http');
const path = require('path');
const request = require('request');
const routes = require('./bin/routes');
const activity = require('./bin/routes/activity');

const app = express();

// Configure Express
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('port', ServerConfig.PORT);
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.methodOverride());
//app.use(express.favicon());

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

// Hub Exchange Routes
app.get('/', routes.index);
app.post('/login', routes.login);
app.post('/logout', routes.logout);

// Custom Activity Routes
app.post('/api/save/', activity.save);
app.post('/api/stop/', activity.stop);
app.post('/api/validate/', activity.validate);
app.post('/api/publish/', activity.publish);
app.post('/api/execute/', activity.execute);

http.createServer(app).listen(app.get('port'), function() {
    console.log('SFMC - JB - Activity App is listening on port ' + app.get('port'));
});