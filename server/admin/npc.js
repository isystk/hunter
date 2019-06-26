/**
 * @fileOverview NPCコントローラー
 * @name npc.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 * @license
 */

var adminService = require('../service/admin');
var commonDao = require('../dao/common');

function NpcController() {
}

module.exports = new NpcController();

/**
 * NPCの一覧を取得
 * @param user
 * @param data
 */
NpcController.prototype.list = function(user, data) {
	adminService.list('npcs', {selector: {}, page: data.page}, function(err, result) {
		user.send('npc.list', result);
	});
};


/**
 * NPCの保存
 * @param user
 * @param data
 */
NpcController.prototype.save = function(user, data) {
	var criteria = {};
	if (data._id === '') {
		data._id = null;
	}
	criteria._id = commonDao.ObjectID(data._id);
	delete data._id;
	adminService.save('npcs', criteria, data, function(err, result) {
		user.send('npc.save', result);
	});
};


/**
 * NPCの削除
 * @param user
 * @param data
 */
NpcController.prototype.remove = function(user, data) {
	var criteria = {};
	criteria._id = commonDao.ObjectID(data._id);
	adminService.remove('npcs', criteria, function(err, result) {
		user.send('npc.remove', result);
	});
};


