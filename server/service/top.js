var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var commonDao = require('../dao/common');

function TopService() {
}

module.exports = new TopService();

/**
 * ランキング情報を取得します。
 * @param {Object} data
 * @param {function} callback
 */
TopService.prototype.getRanking = function(data, callback) {
	next(function() {
		var deferred = new Deferred();
		// ユーザー情報を合計ポイント順で取得します
		commonDao.list('users', {where: {}, select: null, sort: {totalScore: -1},skip: data.index, limit: 20}, function(err, result) {
			var rankings = [];
			for (var i=0,len=result.length; i<len; i++) {
				var user = result[i];
				var ranking = {
					snsType: user.snsType,
					screenName: user.screenName || '',
					name: user.name || '',
					image: user.image,
					totalScore: user.totalScore || 0,
					highScore: user.highScore || 0,
					rank: data.index + i + 1
				};
				rankings[i] = ranking;
			}
			deferred.call(rankings);
		});
		return deferred;
	}).next(function(ranking) {
		commonDao.count('users', {}, function(err, result) {
			var res = {
				ranking: ranking,
				max: result
			};
			callback(err, res);
		});
	});
};


