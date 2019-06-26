var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var commonDao = require('../dao/common');

function UserService() {
	this.LOG_TYPE = {
		LOGIN: {key:'login', value:'ログイン', init: true},
		GAME_JOIN: {key:'game.join', value: 'ゲーム参加', init: true},
		GAME_OVER: {key:'game.over', value: 'ゲームオーバー', init: false},
		GAME_STAR: {key:'game.star', value: 'スター取得', init: false},
		GAME_TALK: {key:'game.talk', value: 'チャット', init: false}
	};
}

module.exports = new UserService();

/**
 * オートコンプリート用サーチを実行します
 *
 * @param data
 * @param callback
 * @return
 */
UserService.prototype.autocomplete = function(data, callback) {

	var colname = 'users';
	var term = data.term ? data.term : '';
	var size = data.size ? data.size : 10;
	var reg = data.reg ? data.reg : '';

	var field = 'screenName';
	if (data.field) {
		field = data.field;
	}

	if (data.reg == 'forward') { // 前方一致
		reg = new RegExp('^' + term + '.*');
	} else if (data.reg == 'exact') { // 完全一致
		reg = term;
	} else {
		reg = new RegExp('.*' + term + '.*', 'i');
	}

	var query = {};
	query[field] = reg;

	var result = { list: [] };
	commonDao.list(colname, {where: query, limit: size}, function(err, result) {
		var list = [];
		for (var i=0,len=result.length; i<len; i++) {
			var item = result[i];
			list.push({
				label: item.screenName + ' (' + item.name + ')',
				value: item._id
			 });
		}
		callback(null, list);
	});
};

/**
 * ユーザーログを出力します。
 *
 * @param data
 * @param callback
 * @return
 */
UserService.prototype.log = function(data, callback) {
	var log = {
		userId: data.userId,
		kind: 'activity',
		type: data.type,
		time: new Date().getTime(),
		data: data.data
	};
	commonDao.save('user_logs', null, log, function(err, result) {
		callback(err, result);
	});
};

/**
 * ユーザーログの一覧を取得します。
 *
 * @param data
 * @param callback
 * @return
 */
UserService.prototype.loglist = function(data, callback) {
	commonDao.list('user_logs', {where: data.where, sort: data.sort}, function(err, result) {
		callback(err, result);
	});
};

/**
 * プロフィールを登録します。
 * @param {Object} data
 * @param {function} callback
 */
UserService.prototype.registProfile = function(data, callback) {
	var user = data.user;
	var where = {snsType: user.snsType, userId: user.userId};

	console.log('ユーザー情報を更新します。', user);
	commonDao.upsert('users', where, user, function(err, result) {
		callback(err, result);
	});
};

/**
 * プロフィールを取得します。
 * @param {Object} data
 * @param {function} callback
 */
UserService.prototype.getProfileByUserId = function(data, callback) {
	var where = {snsType: data.snsType, userId: data.userId};
	commonDao.find('users', where, function(err, result) {
		callback(err, result);
	});
};

/**
 * プロフィールを取得します。
 * @param {Object} data
 * @param {function} callback
 */
UserService.prototype.getProfile = function(data, callback) {

	next(function() {
		var deferred = new Deferred();
		// ユーザー情報を取得します
		commonDao.find('users', {_id: data.id}, function(err, result) {
			deferred.call(result);
		});
		return deferred;
	}).next(function(user) {
		// ユーザーの合計ポイントから現在のレベルを取得します
		commonDao.list('levels', {where: {totalScore: {$lte: user.totalScore || 0}}, sort: {level: -1}, limit: 1}, function(err, results) {
			var result = results[0];
			var level = result.level;

			var profile = {
				id: user.id,
				screenName: user.screenName || '',
				name: user.name || '',
				image: user.image,
				totalScore: user.totalScore || 0,
				highScore: user.highScore || 0,
				level: level || 0
			};
			callback(err, profile);
		});
	});
};


