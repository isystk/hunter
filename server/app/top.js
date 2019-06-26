var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var topService = require('../service/top');
var gameService = require('../service/game');
var userService = require('../service/user');
var LOG_TYPE = userService.LOG_TYPE;
var applications = require('../applications');

function TopControl() {
}

module.exports = new TopControl();

/**
 * サインイン処理 この処理は９leapからのアクセスようです。
 * @param {Object} user
 * @param {Object} data
 */
TopControl.prototype.signin = function(user, data) {
	next(function() {
		var deferred = new Deferred();
		// ユーザー情報を登録します
		userService.registProfile({user: data.profile}, function(err, result) {
			deferred.call(result);
		});
		return deferred;
	}).next(function(data) {
		// ユーザー情報を取得します
		userService.getProfileByUserId({snsType: data.snsType, userId: data.userId}, function(err, result) {
			user.send('top.signin', {id: result._id});
		});
	});
};

/**
 * 初期表示処理
 * @param {Object} user
 * @param {Object} data
 */
TopControl.prototype.init = function(user, data) {
	next(function() {
		var memberList = applications.getMemberList();
		// マップ上に表示するゲーム情報を取得します。
		gameService.getGameData({memberList: memberList}, function(err, result) {
			user.send('game.init', {actors: result.actors, items: result.items});
		});
	}).next(function() {
		// 現在接続中のメンバー一覧を取得します。
		var memberList = applications.getMemberList();
		user.send('top.memberList', {memberList:memberList});
	}).next(function() {
	});
};

/**
 * ログイン処理
 * @param {Object} user
 * @param {Object} data
 */
TopControl.prototype.login = function(user, data) {

	next(function() {
		var deferred = new Deferred();
		// ユーザー情報を取得します
		userService.getProfile({id: data.id}, function(err, result) {
			deferred.call(result);
		});
		return deferred;
	}).next(function(profile) {

		user.id = profile.id;
		user.screenName = profile.screenName;
		user.name = profile.name;
		user.image = profile.image;
		user.game = {};
		user.game.totalScore = profile.totalScore;
		user.game.highScore = profile.highScore;
		user.game.level = profile.level;

		// ユーザー情報をアプリケーションに追加します。
		applications.putUser(user);

		// メンバーリストを送信
		var memberList = applications.getMemberList();
		user.send('top.memberList', {memberList:memberList});
		user.sendAll('top.memberList', {memberList:memberList});

		user.send('top.login', {id: user.id, name: user.name, image: user.image});
		user.send('top.message', {message: user.name +'さん。こんにちわ。'});

		// ユーザーログ
		userService.log({'type': LOG_TYPE.LOGIN.key, userId: user.id, data:{userName: user.name}});
	}).next(function() {
		// 現在接続中のメンバー一覧を取得します。
		var memberList = applications.getMemberList();
		user.send('top.memberList', {memberList:memberList});
	});
};

/**
 * ランキング情報を取得します。
 * @param {Object} user
 * @param {Object} data
 */
TopControl.prototype.getRanking = function(user, data) {
	next(function() {
		var deferred = new Deferred();
		// ユーザー情報を取得します
		topService.getRanking({index: data.index}, function(err, result) {
			deferred.call(result);
		});
		return deferred;
	}).next(function(result) {
		user.send('top.getRanking', {ranking: result.ranking, max: result.max});
	});
};

