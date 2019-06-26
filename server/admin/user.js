/**
 * @fileOverview ユーザコントローラー
 * @name user.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 * @license
 */

require('date-utils');
var adminService = require('../service/admin');
var userService = require('../service/user');
var commonDao = require('../dao/common');

function UserController() {
}

module.exports = new UserController();

UserController.prototype.list = function(user, data) {
	user.send('user.list', data);
};

/**
 * ユーザーのオートコンプリート検索
 * @param user
 * @param data
 * @param response
 */
UserController.prototype.search = function(user, data, response) {
	userService.autocomplete(data, function(err, result) {
		if (err) {
			response.error(err);
		} else {
			var res = {};
			res.kind = data.kind;
			res.list = result;
			response.reply(res);
		}
	});
};

/**
 * ログタイプの一覧を取得
 * @param user
 * @param data
 */
UserController.prototype.logtypelist = function(user, data) {
	// ログタイプ設定一覧の取得と配信
	var logType = userService.LOG_TYPE;
	user.send('user.logtypelist', {kind: data.kind, list: logType});
};

/**
 * ログの検索
 * @param user
 * @param data
 */
UserController.prototype.searchLog = function(user, data) {
	var where = {
		kind: data.kind,
		userId: data.userId
	};
	if (data.date || data.enddate) {
		where.time = {};
		if (data.date) {
			where.time.$gte = data.date;
		}
		if (data.enddate) {
			var enddate = new Date(Date.parse(data.enddate, 'y/M/d'));
			where.time.$lt = enddate.addDays(1).toFormat('YYYY/MM/DD');
		}
	}
	// ログタイプ設定一覧の取得と配信
	userService.loglist({where: where, sort: {time: -1}}, function(err,result) {
		if (err) {
			user.sendError(err);
		} else {
			var res = {
				kind: data.kind,
				list: result
			};
			user.send('user.searchLog', res);
		}
	});
};

/**
 * ユーザー情報を取得します。
 * @param user
 * @param data
 */
UserController.prototype.getPoint = function(user, data) {
	userService.getProfile({id: data.userId}, function(err,result) {
		if (err) {
			user.sendError(err);
		} else {
			user.send('user.getPoint', result);
		}
	});
};

/**
 * ユーザー情報を保存します。
 * @param user
 * @param data
 */
UserController.prototype.save = function(user, data) {
	var criteria = {};
	if (data._id === '') {
		data._id = null;
	}
	criteria._id = commonDao.ObjectID(data._id);
	delete data._id;
	adminService.save('users', criteria, data, function(err, result) {
		result._id = criteria._id;
		user.send('user.save', result);
	});
};


