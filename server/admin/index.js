/**
 * @fileOverview コントローラー
 * @name index.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */
var applications = require('../applications');

var Server = function() {
	this.app = undefined;
	this.names = ['admin', 'user', 'level', 'npc'];
};

module.exports = new Server();

/**
 * コントローラーを登録する
 * @param {Array} names コントローラー名
 */
Server.prototype.registController = function() {
	var self = this;
	this.names.forEach(function(name) {
		console.log('Searching ' + name + ' controler');
		var control = require('./'+name);
		for (var method in control) {
			if (method) {
				var ns = name + '.' + method;
				console.log('Add handler [' + ns + ']');
				self.app.handlers[ns] = control[method];
			}
		}
	});
};

/**
 * 管理用レスポンス
 * @param user
 * @param data
 * @return
 */
function AdminResponse(user, data) {
	this.id = data._req;
	this.user = user;
	this.connection = user.connection;
}
/**
 * 管理ユーザーに返信します
 * @param obj
 * @return
 */
AdminResponse.prototype.reply = function(obj) {
	obj._req = this.id;
	this.user.send('_', obj);
};
/**
 * 管理ユーザーにエラーを通達します
 * @param err
 * @return
 */
AdminResponse.prototype.error = function(err) {
	obj._req = this.id;
	user.sendError(err);
};


/**
 * コントローラーへ処理を移譲
 * @param {Connection} user ユーザー
 * @param {String} method メソッド名
 * @param {Object} data クライアントからのデータ(JSON)
 */
Server.prototype.invoke = function(user, method, data) {

	try {
		var handler = this.app.handlers[method];
		var response = new AdminResponse(user, data);
		if (handler === undefined) {
			conn.send('error:' + JSON.stringify({message:'存在しないメソッドが呼ばれました[' + method + ']'}));
		} else {
			handler(user, data, response);
		}
	} catch (e) {
		console.log(e);
	}
};

Server.prototype.setup = function(app) {

	var self = this;
	this.app = app;

	/**
	 * ユーザーがWebSocketに接続した時の処理
	 */
	var onConnection = function(conn) {
		console.log("connection - start");

		// ユーザー情報の初期構成
		var User = require('../user');
		var user = new User(conn);
		applications.putUser(user);

		conn.on('message', function (message) {

			console.log('received message', user.connection.id, message);

			try {
				var midx = message.indexOf(':');
				var method = message.substr(0, midx);
				var json = message.substr(midx+1);
				var data = JSON.parse(json);

				// 認証チェック
				if (!user.session &&
					method != 'admin.login' &&
					method != 'admin.loginSession' &&
					!user.name
				){
					user.sendError(new Error('ログインが必要です'));
					//adminUser.sendError({
					//  name: "name!!",
					//  message: "message!!"
					//})
				} else {
					// コントローラメソッド実行
					self.invoke(user, method, data);
				}
			} catch (e) {
				console.log(e);
			}
		});

		conn.on('disconnect', function () {
			// アプリケーションからユーザーを削除します。
			if (user.id) {
				applications.removeUser(user);
			}
			console.log("connection - disconnect");
		});
	};

	// ユーザー接続時のリスナーを設定します。
	app.emit('onregister', onConnection);

	// コントローラを設定します。
	this.registController();

};

