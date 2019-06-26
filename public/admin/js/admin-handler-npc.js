
Handler.prototype.npc = {};

Admin.FormSpecs.npc = {
	title   : 'NPCの追加/編集',
	desc	: 'ずどーーん',
	method  : 'post',
	action  : 'npc.save',
	class   : 'socket',
	oklabel : '保存',
	fields  : [
		{
			name : '_id',
			type : 'hidden'
		},
		{
			label : '種類',
			name : 'actorType',
			type : 'text',
			class: 'required'
		},
		{
			label: '名称',
			name : 'name',
			type : 'text',
			class: 'required'
		}
	]
};

// NPC一覧表示
Handler.prototype.npc.list = function(data) {

	var list = data.list;

	// 選択されているメニューの背景色を反転させる。
	Admin.activateNav('npc');

	$('#content')
	.empty()
		.tag('nav')
			.tag('li').tag('a').text('NPC追加')
			.click(function() {
				showForm('npc', {});
			})
			.gat().gat()
		.tag('li').tag('a').text('ダウンロード')
		.click(function() {
			showForm('download', {colname:'npcs',name:'NPC',selector:JSON.stringify({})});
			$('form[name=download]').attr('target', '_blank');
		})
		.gat().gat()
		.tag('li').tag('a').text('アップロード')
		.click(function() {
			showForm('upload', {colname:'npcs',name:'NPC',selector:JSON.stringify({}), clean:true});
		})
		.gat().gat()
		.gat()
		.tag('table')
			.tag('caption').text('NPC').gat()
			.tag('thead')
				.tag('tr')
					.tag('th').text('種類').gat()
					.tag('th').text('名称').gat()
					.tag('th').text('').gat()
				.gat()
			.gat()
			.tag('tbody')
				.exec(function() {
					for (var i = 0, len = list.length; i < len; i++) {
						var item = list[i];
						$(this)
						.tag('tr')
							.data('npc', item)
							.click(function() {
								var itm = $(this).data('npc');
								showForm('npc', itm);
							})
							.tag('td').text(item.actorType).gat()
							.tag('td').text(item.name).gat()
							.tag('td')
								.tag('button').addClass('icon remove').click(function() {
									removeConfirm($(this).parents('tr:first').data('npc'));
									return false;
								}).gat()
							.gat()
						.gat();
					}
				})
			.gat()
			.tag('tfoot')
				.tag('tr')
					.tag('th').attr('colspan', 5).pager('npc.list', data).gat()
				.gat()
			.gat()
		.gat()
	;

	//削除確認
	var removeConfirm = function(data) {
		if (confirm('本当にこのNPC設定を削除しますか？')){
			Admin.client.send('npc.remove', data);
		}
	};
};

//NPC設定保存完了
Handler.prototype.npc.save = function(data) {
	hideForm();
	Admin.client.showStat('NPC設定を保存しました');
	Admin.client.list("npc", {selector: {}});
};

//NPC設定削除完了
Handler.prototype.npc.remove = function(data) {
	hideForm();
	Admin.client.showStat('NPC設定を削除しました');
	Admin.client.list("npc", {selector: {}});
};

