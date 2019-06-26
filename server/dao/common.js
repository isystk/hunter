var mongoose = require('mongoose');
var config = require('../config');
var colmap = {};
var db = {};

function CommonDao() {
	db = mongoose.connect('mongodb://'+config.mongodb.hostname+'/'+config.mongodb.database);
	var schemas = config.mongodb.schemas;
	for (var i=0,len=schemas.length; i<len; i++) {
		var schema = schemas[i];
		for (var key in schema) {
			var model = new mongoose.Schema(schema[key]);
			mongoose.model(key, model);
			colmap[key] =  mongoose.model(key);
		}
	}
}

module.exports = new CommonDao();

/**
 * データベース内の一件を取得
 * @param {String} colname コレクション名
 * @param {Object} data
 * @param {function} callback
 */
CommonDao.prototype.find = function(colname, data, callback) {
	var col = colmap[colname];
	if (!col) {
		return callback("no such table colname:["+colname+"]");
	}

	console.log('検索条件', colname, data);
	col
		.findOne(data, function(err, result) {
			console.log('検索結果', result);
			callback(err, result);
		});
};


/**
 * データベース内の一覧取得
 * @param {String} colname コレクション名
 * @param {Object} data
 * @param {function} callback
 */
CommonDao.prototype.list = function(colname, data, callback) {
	var col = colmap[colname];

	if (!col) {
		return callback("no such table colname:["+colname+"]");
	}

	console.log('検索条件', colname, data);
	col
		.find(data.where, data.select, {sort: data.sort, skip: data.skip, limit: data.limit}, function(err, result) {
			console.log('検索結果', result);
			callback(err, result);
		});
};

/**
 * データベース内のデータ件数取得
 * @param {String} colname コレクション名
 * @param {Object} data
 * @param {function} callback
 */
CommonDao.prototype.count = function(colname, data, callback) {
	var col = colmap[colname];

	if (!col) {
		return callback("no such table colname:["+colname+"]");
	}

	console.log('検索条件', colname, data);
	col
		.count(data, function(err, result) {
			console.log('検索結果', result);
			callback(err, result);
		});
};

/**
 * データを更新(insert or update)
 * @param {String} colname コレクション名
 * @param {Object} criteria
 * @param {Object} data
 * @param {function} callback
 */
CommonDao.prototype.save = CommonDao.prototype.upsert = function(colname, criteria, data, callback) {
	var col = colmap[colname];

	if (!col) {
		return callback("no such table colname:["+colname+"]");
	}

	if (!criteria) {
		criteria = {
			_id : new db.mongo.ObjectID()
		};
	}
	console.log('データ登録', colname, criteria, data);
	col
		.update(criteria, {$set: data}, {upsert: true}, function(err) {
			callback(err, data);
		});
};

/**
 * データを削除(delete)
 * @param {String} colname コレクション名
 * @param {Object} criteria
 * @param {function} callback
 */
CommonDao.prototype.remove = function(colname, criteria,  callback) {
	var col = colmap[colname];

	if (!col) {
		return callback("no such table colname:["+colname+"]");
	}

	console.log('データ削除', colname, criteria);
	// TODO ここでundefinedのエラーが出ているのであとで調査
	col
		.remove(criteria, function(err) {
			callback(err);
		});
};

/**
 * IDを生成します。
 * @param {Object} id
 */
CommonDao.prototype.ObjectID = function(id) {
	return new db.mongo.ObjectID(id);
};


