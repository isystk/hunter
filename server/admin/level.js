/**
 * @fileOverview レベルコントローラー
 * @name level.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 * @license
 */

var adminService = require('../service/admin');
var commonDao = require('../dao/common');

function LevelController() {
}

module.exports = new LevelController();

/**
 * レベルの一覧を取得
 * @param user
 * @param data
 */
LevelController.prototype.list = function(user, data) {
	adminService.list('levels', {selector: {}, page: data.page, sort: {level: 1}}, function(err, result) {
		user.send('level.list', result);
	});
};


/**
 * レベルの保存
 * @param user
 * @param data
 */
LevelController.prototype.save = function(user, data) {
	var criteria = {};
	if (data._id === '') {
		data._id = null;
	}
	criteria._id = commonDao.ObjectID(data._id);
	delete data._id;
	adminService.save('levels', criteria, data, function(err, result) {
		user.send('level.save', result);
	});
};


/**
 * レベルの削除
 * @param user
 * @param data
 */
LevelController.prototype.remove = function(user, data) {
	var criteria = {};
	criteria._id = commonDao.ObjectID(data._id);
	adminService.remove('levels', criteria, function(err, result) {
		user.send('level.remove', result);
	});
};


