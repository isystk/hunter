Handler.prototype.user = {};

// Form Specifications
Admin.FormSpecs.user = {
	title: 'ユーザーの編集',
	desc: 'ユーザー様様',
	method: 'post',
	action: 'user.save',
	class   : 'socket',
	oklabel: '保存',
	fields: [
		{
			name : '_id',
			type : 'hidden'
		},
		{
			label: '合計スコア',
			name : 'totalScore',
			type : 'text',
			class: 'required'
		},
		{
			label: '最大スコア',
			name : 'highScore',
			type : 'text',
			class: 'required'
		}
	]
};


var logtypeLabels = {};

/**
 * メニュー選択時の画面表示
 */
Handler.prototype.user.list = function(data) {

	// 選択されているメニューの背景色を反転させる。
	Admin.activateNav('user');

	$('#content')
		.empty()
		.tag('nav').addClass('subMenu')
			.tag('ul')
				.tag('li')
					.tag('a')
						.text('検索')
						.click(function() {

							// 検索方法
							var reg = '';

							$('#user nav ul').children('li').removeClass('active');
							$(this).closest('li').addClass('active');
							$('#search')
							.empty()
								.tag('fieldset')
									.tag('legend').text('ユーザーID').gat()
									.tag('span').addClass('description').text('検索よーい').gat()
									.tag('p')
										.tag('input').attr('type', 'radio').addClass('radioButtonUserSearch').attr('name', 'usersearch').attr('value', 'forward').attr('id', 'radioforward').attr('checked', 'checked').gat()
										.tag('label').attr('for', 'radioforward').text('前方一致')
											.click(function() {
												reg = 'forward';
											})
										.gat()
										.tag('input').attr('type', 'radio').attr('name', 'usersearch').attr('value', 'exact').attr('id', 'radioexact').gat()
										.tag('label').attr('for', 'radioexact').text('完全一致')
											.click(function() {
												reg = 'exact';
											})
										.gat()
										.tag('input')
											.attr('id', 'user_search')
											.attr('type', 'text')
											.attr('placeholder', 'ユーザーIDを入力してください')
											.addClass('required')
											.autocomplete({
												source: function(req,res) {
													req.term = req.term.replace(/\s|　/g,"");
													Admin.client.send('user.search', {
														type: 'user',
														term: req.term,
														reg: reg,
														prefix: true
													}, function(result) {
														res(result.list);
													});
												},
												select: function(event,obj) {
													$('#detail')
													.empty()
														.tag('div').attr('id', 'sub')
															.tag('nav').addClass('subMenu')
																.tag('ul')
																	.tag('li')
																		.tag('a')
																			.text('行動ログ').click(function() {
																				$('#sub nav ul').children('li').removeClass('active');
																				$(this).closest('li').addClass('active');
																				Admin.client.send('user.logtypelist', {kind: 'activity', userId: obj.item.value});
																				return false;
																			})
																		.gat()
																	.gat()
																	.tag('li')
																		.tag('a')
																			.text('ポイント').click(function() {
																				$('#sub nav ul').children('li').removeClass('active');
																				$(this).closest('li').addClass('active');
																				Admin.client.send('user.getPoint', {userId: obj.item.value});
																				return false;
																			})
																		.gat()
																	.gat()
																.gat()
															.gat()
															.tag('div').attr('id', 'detail').gat()
														.gat()
													;
												}
											})
										.gat()
									.gat()
								.gat()
								.tag('div').attr('id', 'detail').gat()
							;
							$('#user #user_search').focus();
						})
					.gat()
				.gat()
			.gat()
		.gat()
		.tag('div').attr('id', 'search').gat()
	;
	$('nav.subMenu li:first a').click();
};

//ログタイプ一覧表示
Handler.prototype.user.logtypelist = function(data) {
	var kind = data.kind;
	$('#sub #detail')
		.empty()
		.exec(function(){
			$(this)
				.tag('div')
					.tag('form').attr('id', 'form_activity').attr('name', 'form_activity')
						.tag('label').text('期間').gat()
						.tag('input')
							.attr('name', 'date')
							.attr('type', 'text')
							.attr('id', 'logsearch-date')
							.datepicker({dateFormat: 'yy/mm/dd', changeYear: true, changeMonth: true})
							.bind('change', function () {
								var userId = $('#user_search').val();
								$('span#errorMsg').empty();
								if (userId === '') {
									$('#errorMsg').text('ユーザーIDを入力してください');
									return false;
								}
								$('#log-result-tbody')
									.empty()
									.tag('tr').tag('td').attr('colspan', 9).text('検索中です...').gat().gat();
								var selector = {
									kind: kind,
									userId: userId,
									date: $('#logsearch-date').val(),
									enddate: $('#logsearch-enddate').val()
								};
								Admin.client.send('user.searchLog', selector);
								return false;
							})
						.gat()
						.tag('span').text(' 〜 ').gat()
						.tag('input')
							.attr('name', 'enddate')
							.attr('type', 'text')
							.attr('id', 'logsearch-enddate')
							.datepicker({dateFormat: 'yy/mm/dd', changeYear: true, changeMonth: true})
							.bind('change', function () {
								var userId = $('#user_search').val();
								$('span#errorMsg').empty();
								if (userId === '') {
									$('span#errorMsg').text('ユーザーIDを入力してください');
									return false;
								}
								$('#log-result-tbody')
									.empty()
									.tag('tr').tag('td').attr('colspan', 9).text('検索中です...').gat().gat();
								var selector = {
									kind: 'activity',
									date: $('#logsearch-date').val(),
									enddate: $('#logsearch-enddate').val(),
									userId: $('#user_search').val()
								};
								Admin.client.send('user.searchLog', selector);
								return false;
							})
						.gat()
					.gat()
				.gat()
				.tag('ul').addClass('checklist').attr('id','log-types')
				.exec(function() {
					var today = new Date().toFormat('YYYY/MM/DD');
					$('#logsearch-enddate').val(today);

					var selector = {
						kind: 'activity',
						date: $('#logsearch-date').val(),
						enddate: $('#logsearch-enddate').val(),
						userId: $('#user_search').val()
					};
					Admin.client.send('user.searchLog', selector);

					for (var key in data.logtype) {
						var itm = data.logtype[key];
						var tag =
							$(this)
								.tag('li').attr('id',itm.key).text(itm.value)
								.click(function() {
									$(this).toggleClass('active');
									refleshLogTable();
								})
						;
						tag.gat();
						// 初期選択
						if (itm.init) {
							tag.addClass('active');
						}
					}
					logtypeLabels = {};
					for (var key in data.list) {
						var itm = data.list[key];
						var tag =
							$(this)
								.tag('li').attr('id',itm.key).text(itm.value)
								.click(function() {
									$(this).toggleClass('active');
									refleshLogTable();
								})
						;
						tag.gat();
						// 初期選択
						if (itm.init) {
							tag.addClass('active');
						}
						logtypeLabels[itm.key] = itm.value;
					}
				})
				.gat()
				.tag('div').attr('id', 'result-data')
				.gat()
			;
		});
	;
};

Handler.prototype.user.searchLog = function(data) {
	updateLogTable(data);
};

/**
 * 検索したログデータの一覧表示
 */
function updateLogTable(data) {
	var kind = data.kind;
	var result = $('#result-data').empty();
	var logtypes = {};
	$('#log-types li').each(function() {
		if ($(this).hasClass('active')) {
			logtypes[$(this).attr('id')] = true;
		}
	});
	result
	.tag('table').attr('id', 'result-data-table')
		.tag('thead')
			.tag('tr')
				.tag('th').text('時間').gat()
				.tag('th').text('タイプ').gat()
				.tag('th').text('コンテンツ').gat()
			.gat()
		.gat()
		.tag('tbody').attr('id','log-result-tbody')
		.exec(function() {
			for (var i = 0, len=data.list.length; i < len; i++) {
				var logdata = data.list[i];
				$(this)
				.tag('tr')
					.data('logdata', logdata)
					.tag('td').text(Admin.formatDate(logdata.time) || '').gat()
					.tag('td').text(logtypeLabels[logdata.type] || '').gat()
					.tag('td').text(logdata.data ? JSON.stringify(logdata.data) : '').gat()
					.click(function() {
						var d = $(this).data('logdata');
						alert(JSON.stringify(d, null, ' '));
					})
				.hide()
				.gat();
			}
		})
		.gat()
	.gat();

	// タブで選択されたログのみを表示します。
	refleshLogTable();
}

/**
 * タブで選択されたログのみを表示します。
 */
function refleshLogTable() {
	var logtypes = {};
	$('#log-types li').each(function() {
		if ($(this).hasClass('active')) {
			logtypes[$(this).attr('id')] = true;
		}
	});
	$('#log-result-tbody')
		.find('tr').each(function() {
			var $tr = $(this),
				logdata = $tr.data('logdata');
			if (logtypes[logdata.type]) {
				$tr.show();
			} else {
				$tr.hide();
			}
		});
}

Handler.prototype.user.getPoint = function(data) {
	$('#sub #detail')
		.empty()
		.exec(function(){
			$(this)
			.tag('table')
				.tag('tr')
					.tag('th').text('合計スコア').gat()
					.tag('td').text(data.totalScore).gat()
				.gat()
				.tag('tr')
					.tag('th').text('最大スコア').gat()
					.tag('td').text(data.highScore).gat()
				.gat()
				.tag('tr')
					.tag('th').text('レベル').gat()
					.tag('td').text(data.level).gat()
				.gat()
			.gat()
			.tag('br')
			.gat()
			.tag('div')
				.tag('button').text('編集').click(function() {
					showForm('user', {
						_id: data.id,
						totalScore: data.totalScore,
						highScore: data.highScore
					 });
					return false;
				}).gat()
			.gat()
			;
	});

};


// ユーザー情報保存完了
Handler.prototype.user.save = function(data) {
	hideForm();
	Admin.client.showStat('ユーザー情報を保存しました');
	Admin.client.send('user.getPoint', {userId: data._id});
};

