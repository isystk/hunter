/**
 * @fileOverview 自動URLルーティング
 * @name routes.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var Routes = function() {};

module.exports = new Routes();

/**
 * 自動でroutes/フォルダのURLルーティングを行う。
 */
Routes.prototype.setup = function(route, app) {
	/**
	 * ルーティングの登録を行う
	 * @param {Object} route 定義オブジェクト
	 * @param {Object} app サービス
	 */
	var register = function(route, app) {
		var routes = {'get': route.gets, 'post': route.posts, 'put': route.puts, 'delete': route.deletes};
		for (var route in routes) {
			for (var uri in routes[route]) {
				var args = routes[route][uri];
				if (args instanceof Array) {
					app[route](uri, args[0], args[1]);
				} else {
					app[route](uri, args);
				}
				console.log('Add Routing ' + route, uri);
			}
		}
	};

	register(route, app);

};

