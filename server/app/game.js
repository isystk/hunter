var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var gameService = require('../service/game');
var applications = require('../applications');
var userService = require('../service/user');
var LOG_TYPE = userService.LOG_TYPE;
var Const = require('../../public/app/js/source/const');

function GameControl() {
}

module.exports = new GameControl();

/**
 * プレイヤーがゲームに参加
 * @param {Object} user
 * @param {Object} data
 */
GameControl.prototype.actorJoin = function(user, data) {

	// ゲームに既に参加済みの場合は以降処理しない
	if (user.game.isJoin === true) {
		return;
	}

	// ゲームに参加中に設定
	user.game.isJoin = true;
	user.game.actorType = Const.ActorType.HUMAN;
	user.game.x = 6 * 16 - 8; // 初期ポジション
	user.game.y = 10 * 16; // 初期ポジション

	user.game.score = 0; // スコアを初期化

	// ユーザー情報を更新
	applications.putUser(user);

	var actor = {
		id: user.id,
		name: user.name,
		actorType: user.game.actorType,
		x: user.game.x,
		y: user.game.y,
		totalScore: user.game.totalScore,
		highScore: user.game.highScore,
		level: user.game.level
	};
	user.send('game.actorJoin', {actor: actor});

	var actors = {};
	actors[user.id] = actor;
	user.sendAll('game.actorAdd', {actors: actors});
	user.sendAll('top.message', {message: user.name +'さんが、参加しました。'});

	// ユーザーログ
	userService.log({'type': LOG_TYPE.GAME_JOIN.key, userId: user.id, data:{totalScore: user.game.totalScore, highScore: user.game.highScore, level: user.game.level}});
};

/**
 * プレイヤーが移動
 * @param {Object} user
 * @param {Object} data
 */
GameControl.prototype.actorMove = function(user, data) {

	// ゲームに不参加の場合は以降処理しない
	if (user.game.isJoin === false) {
		return;
	}

	// ユーザー情報を更新
	user.game.x = data.x;
	user.game.y = data.y;
	applications.putUser(user);

	var actor = {
		id : user.id,
		x : data.x,
		y : data.y,
		nx : data.nx,
		ny : data.ny
	};
	var actors = {};
	actors[actor.id] = actor;
	user.sendAll('game.actorMove', {actors: actors});
};

/**
 * プレイヤーが攻撃を受けた
 * @param {Object} user
 * @param {Object} data
 */
GameControl.prototype.actorHit = function(user, data) {

	// ゲームに不参加の場合は以降処理しない
	if (user.game.isJoin === false) {
		return;
	}

	var result = {
		id: user.id,
		x: user.game.x,
		y: user.game.y
	};
	user.send('game.actorHit', result);
	user.sendAll('game.actorHit', result);

	// プレイヤーがゲームから退場
	var actorRemove = function(user, data) {

		// ゲームに不参加の場合は以降処理しない
		if (user.game.isJoin === false) {
			return;
		}

		// ゲームに未参加に設定
		user.game.isJoin = false;

		// ユーザー情報を更新
		applications.putUser(user);

		var result = {id: user.id};
		user.send('game.actorRemove', result);
		user.sendAll('game.actorRemove', result);
		user.sendAll('top.message', {message: user.name +'さんが、退場しました。'});

		// ユーザーログ
		userService.log({'type': LOG_TYPE.GAME_OVER.key, userId: user.id, data:{totalScore: user.game.totalScore, highScore: user.game.highScore, level: user.game.level}});
	};
	actorRemove(user, {});
};


/**
 * プレイヤーがアイテムを取得した
 * @param {Object} user
 * @param {Object} data
 */
GameControl.prototype.getItem = function(user, data) {

	// ゲームに不参加の場合は以降処理しない
	if (user.game.isJoin === false) {
		return;
	}

	var itemId = data.itemId;

	var point = 1;
	var score = user.game.score + point;
	var totalScore = user.game.totalScore + point;
	user.game.score = score;
	user.game.totalScore = totalScore;

	// ハイスコア可動化を判定
	if (user.game.highScore < score) {
		user.game.highScore = score;
	}

	// ユーザー情報を更新
	applications.putUser(user);

	var result = {
		score: score,
		totalScore: totalScore
	};
	user.send('game.getItem', result);

	var result2 = {
		itemId: itemId
	};
	user.send('game.removeItem', result2);
	user.sendAll('game.removeItem', result2);

	gameService.getItem({id: user.id, totalScore: totalScore, highScore: user.game.highScore, itemId: itemId}, function(err, result) {
	});

	// ユーザーログ
	userService.log({'type': LOG_TYPE.GAME_STAR.key, userId: user.id, data:{totalScore: user.game.totalScore, highScore: user.game.highScore, level: user.game.level}});
};

/**
 * チャット
 * @param {Object} user
 * @param {Object} data
 */
GameControl.prototype.actorTalk = function(user, data) {

	// ゲームに不参加の場合は以降処理しない
	if (user.game.isJoin === false) {
		return;
	}

	var result = {id: user.id, text: data.text};
	user.send('game.actorTalk', result);
	user.sendAll('game.actorTalk', result);

	// ユーザーログ
	userService.log({'type': LOG_TYPE.GAME_TALK.key, userId: user.id, data:{text: data.text}});
};



