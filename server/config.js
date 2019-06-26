/**
 * @fileOverview 設定ファイル
 * @name config.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var fs = require('fs');

/**
 * 設定
 */
var Config = function () {
};

module.exports = new Config();
Config.prototype.setup = function (path, callback) {

	var json = fs.readFileSync(path);
	var conf = JSON.parse(json);
	for (var key in conf) {
		if (conf.hasOwnProperty(key)) {
			this[key] = conf[key];
		}
	}
};

