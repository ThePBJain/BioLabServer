#!/usr/bin/env node

require('dotenv').load();

const express = require('express');
var http = require('http');
var fs = require('fs');

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var swig = require('swig');
var passport = require('./lib/auth');
var LocalStrategy = require('passport-local').Strategy;
//var views = require('gentelella');



// *** seed the database *** //
if (process.env.NODE_ENV === 'development') {
    var seedAdmin = require('./models/seeds/admin.js');
    seedAdmin();
}


// *** config file *** //
var config = require('./_config');


// *** routes *** //
var mainRoutes = require('./routes/index');
var authRoutes = require('./routes/auth');
var userAPIRoutes = require('./routes/api/user');


// *** express instance *** //
var app = express();


// *** view engine *** ///
swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


// *** static directory *** ///
//todo: work to fix this, maybe use require or put path directly
app.set('views', path.join(__dirname, '../node_modules/gentelella/production/'));


// *** config middleware *** //

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_KEY || 'change_me',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.danger = req.flash('danger');
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../', '/node_modules/gentelella/')));
//app.use(express.static('../node_modules/gentelella/'));
app.use('/images', express.static(path.join(__dirname, '../', '/node_modules/gentelella/production/images/')));
app.use(express.static('../node_modules/gentelella/production/vendors/'));


// *** mongo *** //
var uri = config.mongoURI[process.env.NODE_ENV];
//console.log(uri);
app.set('dbUrl', uri);
mongoose.connect(app.get('dbUrl'), { useMongoClient: true });


// *** main routes *** //
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/api/v1/', userAPIRoutes);


// *** error handlers *** //

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('page_500', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('page_500', {
        message: err.message,
        error: {}
    });
});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Express server listening on ' + bind);
}