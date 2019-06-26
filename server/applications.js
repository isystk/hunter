/**
 * @fileOverview アプリケーションサービスの管理
 * @name application.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var events = require('events');
var util = require('util');
var socket = require('socket.io');
var http = require('http');

var Applications = function() {
	this.users = {};
};

module.exports = new Applications();

/**
 * サービスの新規作成
 * @returns {Object}
 */
Applications.prototype.createServer = function(app) {
	var server = http.createServer(app).listen(app.get('port'));

	var self = this;

	// アプリケーション
	var Application = function(express) {
		events.EventEmitter.call(this);

		this.express = express;
		this.handlers = {};

		/**
		 * アプリケーションの各種登録処理
		 * @param {function} onConnection connectionの関数
		 * @throws {Error} 
		 */
		this.on('onregister', function(onConnection) {
			var ws = undefined;
			console.log('socket.io listen!');
			this.server = ws = socket.listen(this.express);

			ws.sockets.on('connection', onConnection);

			return;
		});
	};
	util.inherits(Application, events.EventEmitter);

	return new Application(server);
};

/**
 * アプリケーションに接続中のユーザーを追加します。
 * @param {Object} user
 */
Applications.prototype.putUser = function(user) {
	this.users[user.connection.id] = user;
};

/**
 * アプリケーションに接続中のユーザーを削除します。
 * @param {Object} user
 */
Applications.prototype.removeUser = function(user) {
	delete this.users[user.connection.id];
};

/**
 * アプリケーションに接続中のすべてのユーザーを取得します。
 * @returns {Object} 
 */
Applications.prototype.getUserList = function() {
	return this.users;
};

/**
 * アプリケーションに接続中のすべてのユーザー情報を取得します。
 * @returns {Object} 
 */
Applications.prototype.getMemberList = function() {
	var memberList = [];
	for (var key in this.users) {
		var user = this.users[key];
		memberList.push({id: user.id, name: user.name, image: user.image, game: user.game});
	}
	return memberList;
};

