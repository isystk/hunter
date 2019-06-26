/**
 * @fileOverview 管理ツール
 * @name admin.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var adminService = require('../service/admin');

function AdminController() {
}

module.exports = new AdminController();

/**
 * セッションキーによる管理ユーザーログインを実施します
 * @param user
 * @param {name, role, session} data
 */
AdminController.prototype.loginSession = function(user, data) {
	adminService.loginSession({userId:data.userId, session: data.session}, function(err, result) {
		if (err) {
			user.send('admin.loginError', result);
			return;
		}
		user.id  = result.userId;
		user.name  = result.name;
		var docs = {
			id: user.id,
			name: user.name,
			type: 'login'
		};
		//adminService.oplog(user, 'admin.login', docs);
		user.send('admin.loginSession', result);
	});
};

/**
 * 管理ユーザーログインを実行します。
 * @param user
 * @param data
 * @return
 */
AdminController.prototype.login = function(user, data) {
	next(function() {
		var deferred = new Deferred();
		adminService.login(data, function(err, result) {
			if(err || !result){
				user.send('admin.loginError', result);
				return;
			}
			deferred.call(result);
		});
		return deferred;
	}).next(function(result) {
		user.id  = result.userId;
		user.name  = result.name;
		var docs = {
			id: user.id,
			name: user.name,
			type: 'login'
		};
		adminService.oplog(user, 'admin.login', docs);
		user.send('admin.login', result);
	});
};


/**
 * 操作ログ一覧を取得します。
 * @param user
 * @param data
 */
AdminController.prototype.list = function(user, data) {
	if (!data.sort) {
		data.sort = {};
		data.sort.time = -1;
	}
	adminService.list('admin_oplogs', data, function(err, result) {
		if (err) {
			return user.sendError(err);
		}
		user.send('admin.list', result);
	});
};

