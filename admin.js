/**
 * Module dependencies.
 */

var express = require('express')
	, controller = require('./server/admin')
	, bootstrap = require('./server/bootstrap')
	, routes = require('./server/routes')
	, config = require('./server/config')
	, applications = require('./server/applications');

bootstrap.setup(__dirname, 'admin', function(err) {
	if (err) {
		throw new Error(err);
	}

	var app = express();

	// Configuration
	app.configure(function(){
		app.set('port', config.admin.port);
		app.set('views', __dirname + '/views/admin');
		app.set('view engine', 'jade');
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.use(express.session({ secret: 'foo bar' }));
		app.use(app.router);
		app.use(express.static(__dirname + '/public/admin'));
	});

	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function(){
		app.express.use(express.errorHandler());
	});

	var route = require('./routes/admin');
	routes.setup(route, app);

	var server = applications.createServer(app);
	controller.setup(server);

	var io = require('socket.io').listen(server);

});

