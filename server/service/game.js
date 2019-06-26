var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var commonDao = require('../dao/common');
var npc = require('../app/npc');

function GameService() {
}

module.exports = new GameService();

/**
 * マップ上に表示するゲーム情報を取得します。
 * @param {Object} data
 * @param {function} callback
 */
GameService.prototype.getGameData = function(data, callback) {
	var actors = {};
	for (var i=0,len=data.memberList.length;i<len;i++) {
		var member = data.memberList[i];
		var game = member.game;
		if (!game || game.isJoin !== true) {
			continue;
		}
		var actor = {
			id : member.id,
			name : member.name,
			actorType : member.game.actorType, // キャラクター
			x : member.game.x, // 初期ポジション
			y : member.game.y, // 初期ポジション
			talk : member.game.talk // 会話
		};
		actors[actor.id] = actor;
	}
	// NPCの情報を取得します。
	var npcs = npc.getNpc();
	for (var key in npcs) {
		actors[key] = npcs[key];
	}

	// アイテムの情報を取得します。
	var items = npc.getItem();

	callback(null, {actors: actors, items: items});
};


/**
 * アイテムを取得した時の処理
 * @param {Object} data
 * @param {function} callback
 */
GameService.prototype.getItem = function(data, callback) {
	next(function() {
		// 取得したアイテムを削除する
		npc.removeItem(data.itemId);
	}).next(function() {
		var deferred = new Deferred();
		commonDao.upsert('users', {_id: data.id}, {totalScore: data.totalScore, highScore: data.highScore}, function(err, result) {
			deferred.call();
		});
		return deferred;
	}).next(function() {
		callback();
	});
};
