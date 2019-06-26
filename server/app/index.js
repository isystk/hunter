/**
 * @fileOverview コントローラー
 * @name index.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */
var applications = require('../applications');

var Server = function() {
	this.app = undefined;
	this.names = ['top', 'game'];
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
 * コントローラーへ処理を移譲
 * @param {Connection} user ユーザー
 * @param {String} method メソッド名
 * @param {Object} data クライアントからのデータ(JSON)
 */
Server.prototype.invoke = function(user, method, data) {
	try {
		var handler = this.app.handlers[method];
		if (handler === undefined) {
			conn.send('error:' + JSON.stringify({message:'存在しないメソッドが呼ばれました[' + method + ']'}));
		} else {
			handler(user, data);
		}
	} catch (e) {
		console.log(e);
	}
};

Server.prototype.setup = function(app, socket) {

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

		// メンバーリストを送信
		var memberList = applications.getMemberList();
		user.send('top.memberList', {memberList:memberList});
		user.sendAll('top.memberList', {memberList:memberList});

		conn.on('message', function (message) {

			console.log('received message', user.connection.id, message);

			try {
				var midx = message.indexOf(':');
				var method = message.substr(0, midx);
				var json = message.substr(midx+1);
				var data = JSON.parse(json);

				// コントローラメソッド実行
				self.invoke(user, method, data);
			} catch (e) {
				console.log(e);
			}
		});

		conn.on('disconnect', function () {
			// アプリケーションからユーザーを削除します。
			if (user.id) {
				applications.removeUser(user);

				// ゲームから離脱します
				user.sendAll('game.actorRemove', {id: user.id});

				// 最新のメンバーリストを全員に配信します。
				var memberList = applications.getMemberList();
				user.sendAll('top.memberList', {memberList:memberList});
			}
			console.log("connection - disconnect");
		});
	};
	// ユーザー接続時のリスナーを設定します。
	app.emit('onregister', onConnection);

	// コントローラを設定します。
	this.registController();

	// NPCを生成します。
	var npc = require('./npc');
	npc.createNpc();
};

