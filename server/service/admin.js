/**
 * @fileOverview 管理ツール
 * @name admin.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var fs = require('fs');
var crypto = require('crypto');
var os = require('os');
var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var carrier = require('../carrier');
var commonDao = require('../dao/common');
var config = require('../config');

function AdminService() {
}

module.exports = new AdminService();

/**
 * 管理ツールの操作ログを記録します
 * @param {String} name ログイン名
 * @param {Object} docs
 * @param {function} callback
 */
AdminService.prototype.oplog = function(user, type, docs, callback) {
	var now = new Date().getTime();

	// IPアドレスを取得する
	var getIpAddr = function(name, family) {
		family = family || 'IPv4';
		var ifs = os.networkInterfaces();
		if (ifs.hasOwnProperty(name) === true) {
			var addrs = ifs[name];
			for (var i = 0; i < addrs.length; i++) {
				if (family === addrs[i].family) {
					return addrs[i].address;
				}
			}
		}
		return undefined;
	};

	// IP取得
	var ip = getIpAddr(config.admin.nic);

	commonDao.save('admin_oplogs', null, {name: user.id, type:type, ip:ip, time:now, data: docs}, function(err, result) {
		callback();
	});
};

/**
 * 管理ログイン処理
 * @param data ログインデータ({name,password})
 * @param callback コールバック({name,session,roles})
 */
AdminService.prototype.login = function(data, callback) {
	commonDao.find('admin_users', {userId: data.userId, password: data.password}, function(err, result) {

		var genSessionKey = function(value, key) {
			var hash = crypto.createHash('sha256');
			hash.update(value + key);
			return hash.digest('base64');
		};

		var key = genSessionKey(result.userId, config.sessionBase);
		callback(null, {
			userId: result.userId,
			name: result.name,
			session: key
		});
	});
};

/**
 * セッションベースのログイン
 * @param data ログイデータ({session})
 * @param callback コールバック({name,session,roles})
 */
AdminService.prototype.loginSession = function(data, callback) {

	var userId = data.userId;
	var session = data.session;

	var genSessionKey = function(value, key) {
		var hash = crypto.createHash('sha256');
		hash.update(value + key);
		return hash.digest('base64');
	};

	var key = genSessionKey(userId, config.sessionBase);
	if (key == session) {
		commonDao.find('admin_users', {userId: userId}, function(err, result) {
			callback(null, {
				userId: result.userId,
				name: result.name,
				session: key
			});
		});
	} else {
		callback(new Error(), null);
	}
};

/**
 * ログインセッションキーの取得/更新
 * @param {name, sessionBase} data
 * @returns {string} sha256+base64されたセッションキー
 */
AdminService.prototype.genSessionKey = function(data) {
	var hash = crypto.createHash('sha256');
	hash.update(data.name + config.admin.sessionBase);
	return hash.digest('base64');
};

/**
 * データベース内の一覧取得
 * @param {String} colname コレクション名
 * @param {Object} data
 * @param {function} callback
 */
AdminService.prototype.list = function(colname, data, callback) {
	var page = data.page ? Math.max(1, data.page) : 1;
	var size = data.size ? Math.max(1, data.size) : 20;
	var selector = data.selector ? data.selector : {};
	var sort = {_id: 1};

	if (data.sort) {
		sort = data.sort;
	}

	next(function() {
		var deferred = new Deferred();
		commonDao.count(colname, selector, function(err, result) {
			deferred.call(result);
		});
		return deferred;
	}).next(function(count) {
		commonDao.list(colname, {where: selector, sort: sort, skip: (page-1) * size, limit: size}, function(err, list) {
			var maxpage = Math.floor(count / size);
			if (count % size !== 0) {
				maxpage = maxpage + 1;
			}
			var result = {
				list: list,
				page: page,
				maxpage: maxpage
			};
			callback(null, result);
		});
	});
};

/**
 * データを更新(insert or update)
 * @param {String} colname コレクション名
 * @param {Object} criteria
 * @param {Object} data
 * @param {function} callback
 */
AdminService.prototype.save = AdminService.prototype.upsert = function(colname, criteria, data, callback) {
	commonDao.save(colname, criteria, data, function(err, result) {
		callback(null, result);
	});
};

AdminService.prototype.remove = function(colname, selector, callback) {
	commonDao.remove(colname, selector, function(err, result) {
		callback(null, result);
	});
};

/**
 * データをダウンロード
 * @param {String} colname コレクション名
 * @param {Object} selector
 * @param {Object} sort
 * @param {Object} res
 */
AdminService.prototype.download = function(colname, selector, sort, res) {
	var date = new Date();
	var zero = function(num) {
		var str = String(num);
		if (str.length == 1) {
			return '0' + str;
		} else {
			return str;
		}
	};
	var now = date.getFullYear()
	+ zero(date.getMonth()+1)
	+ zero(date.getDate())
	+ zero(date.getHours())
	+ zero(date.getMinutes())
	+ zero(date.getSeconds());
	
	res.writeHead(200, {'Content-Type': 'text-plain', 'Content-disposition': 'attachment;filename=hunter_' + config.mode + '_' + colname + '_' + now + '.json'});

	commonDao.list(colname, {where: selector, sort: sort}, function(err, list) {
		if (err) {
			res.write(err.stack);
			res.end();
		}
		for (var i=0, len=list.length; i<len; i++) {
			var item = list[i];
			res.write(JSON.stringify(item));
			res.write('\n');
		}
		res.end();
	});
};


/**
 * データをアップロード
 * @param {String} colname コレクション名
 * @param {Object} data
 * @param {function} callback
 */
AdminService.prototype.upload = function(colname, selector, clean, path, callback) {

	next(function() {
		// データをクリア
		if (clean === 'true') {
			var deferred = new Deferred();
			commonDao.remove(colname, selector, function(err) {
				deferred.call();
			});
			return deferred;
		}
	}).next(function() {
		var deferred = new Deferred();
		var readFile = function () {
			var list = [];
			var stream = fs.createReadStream(path);
			var carry = carrier.carry(stream);
			carry.on('line', function(line) {
				var data = JSON.parse(line);
				var id = new commonDao.ObjectID(data._id);
				delete data._id;
				list.push({
					_id: id,
					data: data
				});
			});
			carry.on('end', function(end) {
				deferred.call(list);
			});
		}
		readFile();
		return deferred;
	}).next(function(list) {
		console.log('アップロードしたデータを登録します。', list);
		for (var i=0, len=list.length; i<len; i++) {
			var item = list[i];
			commonDao.save(colname, {_id: item._id}, item.data, function(err, result) {
			});
		}
		callback();
	});
};

