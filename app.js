/**
 * Module dependencies.
 */

var express = require('express')
	, controller = require('./server/app')
	, bootstrap = require('./server/bootstrap')
	, routes = require('./server/routes')
	, config = require('./server/config')
	, applications = require('./server/applications')
	, passport = require('passport');

bootstrap.setup(__dirname, 'app', function(err) {
	if (err) {
		throw new Error(err);
	}

	var app = express();

	// Configuration
	app.configure(function(){
		app.set('port', config.app.port);
		app.set('views', __dirname + '/views/app');
		app.set('view engine', 'jade');
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.use(express.session({ secret: 'foo bar' }));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(app.router);
		app.use(express.static(__dirname + '/public/app'));
	});

	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function(){
		app.use(express.errorHandler());
	});

	var route = require('./routes/app');
	routes.setup(route, app);

	var server = applications.createServer(app);
	controller.setup(server);

	var io = require('socket.io').listen(server);

});

