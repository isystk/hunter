/**
 * @fileOverview 管理ツール 操作ログ
 * @name oplog.js
 * @author Yoshitaka Ise <y-ise@ise-web.com>
 */

var oplogTypes = {};


/**
 * 操作ログリストの表示
 * @param {Object} data
 */
Handler.prototype.admin.list = function(data) {

	var list = data.list;

	Admin.activateNav('admin');

	$('#content')
		.empty()
		.tag('table')
		.tag('caption').text('管理操作ログ').gat()
		.tag('thead')
			.tag('tr')
				.tag('th').attr('colspan', 5).pager('admin.list',data).gat()
			.gat()
			.tag('tr')
				.tag('th').text('時間').gat()
				.tag('th').text('ユーザーID').gat()
				.tag('th').text('操作').gat()
				.tag('th').text('概要').gat()
				.tag('th').text('IP').gat()
			.gat()
		.gat()
		.tag('tbody')
			.exec(function() {
				var self = $(this);

				var oplogControlTypes = {
					'save': '保存',
					'remove': '削除',
					'init': '初期化',
					'update': '更新',
					'download': 'ダウンロード',
					'upload': 'アップロード',
					'stop': '停止',
					'copy': 'コピー'
				};

				// 操作ログのタイプ取得
				var getOplogType = function (type) {
					if (!type) {
						return '';
					}
					var p = type.indexOf('.');
					if (p <= 0) {
						return type;
					}
					var t = type.substring(0, p);
					var c = type.substring(p+1);
					if (oplogTypes[t]) {
						t = oplogTypes[t];
					}
					if (oplogControlTypes[c]) {
						c = oplogControlTypes[c];
					}
					return t + ' - ' + c;
				};

				// 操作ログのdesc sort!
				var getOplogData = function (log) {
					if (!log || !log.data) {
						return '';
					}
					var data = log.data;
					var list = [];
					if (data.name) {
						list.push(data.name);
					}
					if (data.colname) {
						list.push(data.colname);
					}
					return list.join(' ');
				};

				for (var i = 0, len = list.length; i < len; i++) {
					var log = list[i];
					var type = getOplogType(log.type);
					var desc = getOplogData(log);
					self
					.tag('tr')
					.data('item', log.data)
					.tag('td').text(log.time ? Admin.formatDate(log.time) : '').gat()
					.tag('td').text(log.name).gat()
					.tag('td').text(type).gat()
					.tag('td').text(desc).gat()
					.tag('td').text(log.ip ? log.ip : '').gat()
					.click(function() {
						var itm = $(this).data('item');
						console.log(itm);
						alert(JSON.stringify(itm));
					})
					.gat();
				}
			})
		.gat()
	.gat();
};
