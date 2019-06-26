/**
 * @fileOverview 管理ツール top page
 * @name admin.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

Handler.prototype.admin = {};

/**
 * ログイン成功
 * @param {Object} data
 */
Handler.prototype.admin.login = function(data) {
	Admin.client.showHeadStat(data.name + 'としてログイン');
	// cookie
	$.cookie('ai', data.userId);
	$.cookie('as', data.session);
	Admin.client.send('admin.list', {size: 100, sort: {_id: -1}});
	Admin.user = data;
};

/**
 * セッションログイン成功
 * @param {Object} data
 */
Handler.prototype.admin.loginSession = function(data) {
	Admin.client.showHeadStat(data.name + 'としてログイン');
	if (Admin.user) {
		Admin.user.userId  = data.userId;
		Admin.user.name  = data.name;
		Admin.user.roles = data.roles;
	} else {
		Admin.user = data;
		Admin.client.send('admin.list', {size:100});
	}
};

/**
 * ログイン失敗
 */
Handler.prototype.admin.loginError = function() {
	hideForm();
	Admin.client.showError('認証に失敗しました');
	$('button.ok').attr('disabled', false);
};

