/**
 * @fileOverview 起動処理
 * @name bootstrap.js
 * @author Yoshitaka Ise <y-ise@ise-web.com
 */
var path = require('path');
var fs = require('fs');
var args = require('./args').parse();
var config = require('./config');

var usage = "usage: " + process.argv[1] + '\n'
	+ '\n'
	+ '\t-p\tlistenポートを指定します。-p 9999\n'
	+ '\t-h\tヘルプを表示します。\n'
	+ '\n';

/**
 * 起動処理
 * @param {function} callback
 */
exports.setup = function(dirname, app, callback) {
	// サーバー起動モードの選択
	var mode = 'local';
	for (var i in process.argv) {
		if (i) {
			var arg = process.argv[i];
			if (arg === '--dev') {
				mode = 'develop';
			} else if (arg === '--stg') {
				mode = 'staging';
			} else if (arg === '--real') {
				mode = 'real';
			}
		}
	}

	// ヘルプを表示
	if (args['h']) {
		process.stderr.write(usage);
		process.exit(2);
	}

	// 引数チェック
	check();

	console.log('Configure the server mode [', mode, ']');

	var configFile = dirname+'/conf/'+mode+'.json';

	// config load
	config.setup(configFile);

	// コンフィグにサーバー起動モードを追加する
	config.mode = mode;

	// PIDファイル
	var prefix = path.basename(process.argv[1]);
	var pidfile = config.piddir+'/'+prefix+'.'+'pid';
	fs.writeFileSync(pidfile, String(process.pid));

	system(); // システム設定

	if (callback !== undefined && callback !== null) {
		callback(null);
	}
};

/**
 * 引数チェック
 */
var check = function () {
	var f = false;

	for (var key in args) {
		if (args.hasOwnProperty(key)) {
			if (args[key] === true) {
				if (key === 'node' ||
					key === '--local' ||
					key === '--dev' ||
					key === '--stg' ||
					key === '--real'
				) {
					continue;
				}
				console.log(key + '" option value is not set.\n');
				f = true;
			}
		}
	}

	if (f) {
		process.stderr.write(usage);
		process.exit(2);
	}
};

/**
 * node.jsの設定を行う
 */
var system = exports.system = function(uncaughtException, sigterm, sigint, exit) {
	// キャッチされない例外処理を追加
	var _uncaughtException = function(err) {
		console.log(err);
	};

	// kill -15
	var _sigterm = function() {
		console.log("Got SIGTERM");
		_exit();
	};

	// Ctrl+c
	var _sigint = function() {
		console.log("Got SIGINT");
		_exit();
	};

	// システム終了
	var _exit = function() {
		console.log("Server is going down");
		clean(function(){
			process.exit(0);
		});
	};
	_uncaughtException = uncaughtException || _uncaughtException;
	_sigterm = sigterm || _sigterm;
	_sigint = sigint || _sigint;
	_exit = exit || _exit;
	
	process.on('uncaughtException', _uncaughtException);
	process.on('SIGTERM', _sigterm);
	process.on("SIGINT", _sigint);
	//process.on("exit", _exit);
	
};

var clean = function(callback) {
	callback(null);
};

