var _ = require('underscore');
var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var commonDao = require('../dao/common');
var applications = require('../applications');
var gameMap = require('../../public/app/js/source/map');
var Const = require('../../public/app/js/source/const');

function Npc() {
	this.npcs = {};
	this.items = {};
}

module.exports = new Npc();

/**
 * モンスターを生成します
 */
Npc.prototype.createNpc = function() {
	var self = this;

	next(function() {
		// NPCを配置する位置をランダムに生成します。
		var ramPos = function () {
			var x = Math.floor( Math.random() * 40 ) * 16; // 初期ポジション
			var y = Math.floor( Math.random() * 30 ) * 16; // 初期ポジション
			// 生成した位置が障害物上の場合は、生成し直す
			if (hitTest(x, y)) {
				return ramPos();
			}
			return {x: x, y: y};
		};

		// アイテムを生成する
		var createItem = function() {
			var t = setTimeout(function() {
				// アイテムが無くなった場合は、追加する
				if (_.isEmpty(self.items)) {
					var pos = ramPos();
					var id = new Date().getTime();
					self.items[id] = {id: id, itemType: Const.ItemType.STAR,  name: '',  x: pos.x, y: pos.y};
					var users = applications.getUserList();
					for (var key in users) {
						var user = users[key];
						user.send('game.addItem', {items: self.items});
					}
				}
				createItem();
			}, 3000);
		};
		createItem();
	}).next(function() {
		// NPCを配置する位置をランダムに生成します。
		var ramPos = function () {
			var x = Math.floor( Math.random() * 40 ) * 16 - 8; // 初期ポジション
			var y = Math.floor( Math.random() * 30 ) * 16; // 初期ポジション
			// 生成した位置が障害物上の場合は、生成し直す
			if (hitTest(x, y)) {
				return ramPos();
			}
			return {x: x, y: y};
		};

		// NPCを生成する
		var deferred = new Deferred();
		commonDao.list('npcs', {}, function(err, result) {
			for (var i=0, len=result.length; i<len; i++) {
				var data = result[i];
				var pos = ramPos();
				var monster = {
					id: data._id,
					//name: data.name || '',
					name: '',
					actorType: data.actorType,
					x: pos.x,
					y: pos.y,
					talk: ''
				};
				self.npcs[monster.id] = monster;
			}
			deferred.call();
		});
		return deferred;
	}).next(function() {
		var MOVE_TYPE = {0: 'right', 1: 'up', 2: 'left', 3: 'down'};
		var moveNpc = function() {
			var t = setTimeout(function() {
				for (var key in self.npcs) {
					var npc = self.npcs[key];
					var pos = MOVE_TYPE[Math.floor( Math.random() * 4 )];
					var x = npc.x;
					var y = npc.y;
					if (pos === 'right') {
						x = x + 16;
					}
					else if (pos === 'up') {
						y = y + 16;
					}
					else if (pos === 'left') {
						x = x - 16;
					}
					else if (pos === 'down') {
						y = y - 16;
					}
					// 衝突判定
					var map = {};
					map.width = 640;
					map.height = 480;
					if (x <= 0 || map.width < x || y <= 0 || map.height < y || hitTest(x, y)) {
						continue;
					}

					npc.x = x;
					npc.y = y;

					self.npcs[key] = npc;
					clearInterval(t);
				}
				var users = applications.getUserList();
				for (var key in users) {
					var user = users[key];
					user.send('game.actorMove', {actors: self.npcs});
				}
				moveNpc();
			}, 3000);
		};
		moveNpc();
	});
};

/**
 * モンスターを取得します
 */
Npc.prototype.getNpc = function() {
	return this.npcs;
};

/**
 * アイテムを取得します
 */
Npc.prototype.getItem = function() {
	return this.items;
};

/**
 * アイテムを削除します
 */
Npc.prototype.removeItem = function(id) {
	delete this.items[id];
};

/**
 * Map上に障害物があるかどうかを判定する.
 * @param {Number} x 判定を行うマップ上の点のx座標.
 * @param {Number} y 判定を行うマップ上の点のy座標.
 * @return {Boolean} 障害物があるかどうか.
 */
function hitTest (x, y) {
	var width = 640;
	var height = 480;
	var _image = {};
	_image.width = 256;
	_image.height = 256;
	var _tileWidth = 16;
	var _tileHeight = 16;
	var _data = [gameMap.backgroundMap, gameMap.fourgroundMap];
	var collisionData = gameMap.collisionData;

	if (x < 0 || width <= x || y <= 16 || height <= y) {
		return true;
	}
	var width = _image.width;
	var height = _image.height;
	var tileWidth = _tileWidth || width;
	var tileHeight = _tileHeight || height;
	x = x / tileWidth | 0;
	y = y / tileHeight -1 | 0;
	if (collisionData != null) {
		return collisionData[y] && !!collisionData[y][x];
	} else {
		for (var i = 0, len = _data.length; i < len; i++) {
			var data = _data[i];
			var n;
			if (data[y] != null && (n = data[y][x]) != null &&
				0 <= n && n < (width / tileWidth | 0) * (height / tileHeight | 0)) {
				return true;
			}
		}
		return false;
	}
};


