/**
 * @fileOverview ユーザ
 * @name user.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var User = function(connection) {
	this.id = undefined; // ユーザーID
	this.name = undefined; // ユーザー名
	this.connection = connection;
};

module.exports = User;

/**
 * データ送信
 * @param {String} method
 * @param {Object} data
 */
User.prototype.send = function(method, data) {
	try {
		var json = JSON.stringify(data);
		//this.connection.send(method + ':' + json);
		this.connection.emit('message', method + ':' + json);
		console.log('send', method, json);
	} catch (e) {
		console.log(e);
	}
};

/**
 * データ送信(接続中の全ユーザーに送信する)
 * @param {String} method
 * @param {Object} data
 */
User.prototype.sendAll = function(method, data) {
	try {
		var json = JSON.stringify(data);
		this.connection.broadcast.emit('message', method + ':' + json);
		console.log('sendAll', method, json);
	} catch (e) {
		console.log(e);
	}
};

/**
 * ERRORデータ送信
 * @param {Error} err
 */
User.prototype.sendError = function(err) {
	this.send('error', {
		name: err.name,
		message: err.message
	});
};

