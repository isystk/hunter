
Handler.prototype.level = {};

Admin.FormSpecs.level = {
	title   : 'レベルの追加/編集',
	desc	: 'ずどーーん',
	method  : 'post',
	action  : 'level.save',
	class   : 'socket',
	oklabel : '保存',
	fields  : [
		{
			name : '_id',
			type : 'hidden'
		},
		{
			label : 'レベル',
			name : 'level',
			type : 'text',
			class: 'required'
		},
		{
			label: '合計スコア',
			name : 'totalScore',
			type : 'text',
			class: 'required'
		}
	]
};

// レベル一覧表示
Handler.prototype.level.list = function(data) {

	var list = data.list;

	// 選択されているメニューの背景色を反転させる。
	Admin.activateNav('level');

	$('#content')
	.empty()
		.tag('nav')
			.tag('li').tag('a').text('レベル追加')
			.click(function() {
				showForm('level', {});
			})
			.gat().gat()
		.tag('li').tag('a').text('ダウンロード')
		.click(function() {
			showForm('download', {colname:'levels',name:'レベル',selector:JSON.stringify({}), sort: JSON.stringify({level: 1}) });
			$('form[name=download]').attr('target', '_blank');
		})
		.gat().gat()
		.tag('li').tag('a').text('アップロード')
		.click(function() {
			showForm('upload', {colname:'levels',name:'レベル',selector:JSON.stringify({}), clean:true});
		})
		.gat().gat()
		.gat()
		.tag('table')
			.tag('caption').text('レベル').gat()
			.tag('thead')
				.tag('tr')
					.tag('th').text('レベル').gat()
					.tag('th').text('合計スコア').gat()
					.tag('th').text('').gat()
				.gat()
			.gat()
			.tag('tbody')
				.exec(function() {
					for (var i = 0, len = list.length; i < len; i++) {
						var item = list[i];
						$(this)
						.tag('tr')
							.data('level', item)
							.click(function() {
								var itm = $(this).data('level');
								showForm('level', itm);
							})
							.tag('td').text(item.level).gat()
							.tag('td').text(item.totalScore).gat()
							.tag('td')
								.tag('button').addClass('icon remove').click(function() {
									removeConfirm($(this).parents('tr:first').data('level'));
									return false;
								}).gat()
							.gat()
						.gat();
					}
				})
			.gat()
			.tag('tfoot')
				.tag('tr')
					.tag('th').attr('colspan', 5).pager('level.list', data).gat()
				.gat()
			.gat()
		.gat()
	;

	//削除確認
	var removeConfirm = function(data) {
		if (confirm('本当にこのレベル設定を削除しますか？')){
			Admin.client.send('level.remove', data);
		}
	};
};

//レベル設定保存完了
Handler.prototype.level.save = function(data) {
	hideForm();
	Admin.client.showStat('レベル設定を保存しました');
	Admin.client.list("level", {selector: {}});
};

//レベル設定削除完了
Handler.prototype.level.remove = function(data) {
	hideForm();
	Admin.client.showStat('レベル設定を削除しました');
	Admin.client.list("level", {selector: {}});
};

