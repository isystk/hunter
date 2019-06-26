// Form Definitions
var Form = function(name) {

	// フォーム仕様を取得
	var spec = Admin.FormSpecs[name];
	if (!spec) {
		throw new Error('spec ' + name + ' does not exist');
	}

	// フォームHTML構成
	var element = $('<form />')
		.attr('name', name)
		.attr('action', spec.action)
		.attr('method', spec.method ? spec.method : 'get')
	;
	if (spec.class)
		element.attr('class' , spec.class);

	var fieldset = element.tag('fieldset');

	if (spec.title) {
		fieldset.tag('legend').text(spec.title).gat();
	}

	if (spec.desc) {
		fieldset.tag('span').addClass('description').text(spec.desc).gat();
	}

	this.inputs = {};
	this.options = {};

	var self = this;

	var createInput = function(field, inputs) {
		var input = null;
		if (field.type == 'file') {
			input = $('<input>').attr('type', field.type).attr('id', field.name).attr('name', field.name);
		}

		if (field.type == 'text' || field.type == 'range' || field.type == 'textarea') {
			if (field.type == 'textarea')
				input = $('<textarea/>');
			else
				input = $('<input/>');
			input.attr('id', field.name);

			for (var n in field) {
				if (n == 'value')
					input.val(field.value);
				else
					input.attr(n, field[n]);
			}

			// Auto Completion
			if (field.autocomplete) {
				var type = field.autocomplete;
				input.autocomplete({
					source: function(req,res) {
						client.send('autocomplete.search', {
							type: type,
							term: req.term
						}, function(result) {
							res(result.list);
						});
					},
					select: function(event,obj) {
						if (field.autocompleteWith)
						{
							for (var i = 0; i < field.autocompleteWith.length; i++) {
								var name = field.autocompleteWith[i];
								if (inputs[name] && obj.item[name])
									inputs[name].val(obj.item[name]);
							}
						}
					}
				});
			}

			if (input.hasClass('date')) {
				input.datepicker({
					dateFormat: 'yy-mm-dd'
				});
				input.data('date', true);
			} else if (input.hasClass('datetime')) {
				input.datetimepicker({
					dateFormat: 'yy-mm-dd',
					timeFormat: 'hh:mm'
				});
				input.data('date', true);
			}

			if (inputs)
				inputs[field.name] = input;
		} else if (field.type == 'select') {
			input = $('<select />').attr('id', field.name).attr('name', field.name);
			for (var i = 0; i < field.labels.length; i++) {
				var label = field.labels[i];
				var value = field.values[i];
				input.tag('option').attr('value', value).text(label).gat();
			}
			for (var n in field) {
				if (n == 'value')
					input.val(field.value);
				else
					input.attr(n, field[n]);
			}
			if (inputs)
				inputs[field.name] = input;
		} else if (field.type == 'checkbox') {
			input = $('<ul/>').attr('class', 'checkbox');
			for (var i = 0; i < field.labels.length; i++) {
				var label = field.labels[i];
				var value = field.values[i];
				var lid = field.name + '_' + value;
				var child = $('<input/>').attr('type','checkbox').attr('id',lid).val(value);
				input
					.tag('li')
						.append(child)
						.tag('label').attr('for',lid).text(label).gat()
					.gat()
				;
				if (inputs)
					if (inputs[field.name])
						inputs[field.name].push(child);
					else
						inputs[field.name] = [child];
			}
		} else if (field.type == 'radio') {
			input = $('<ul/>').attr('class', 'radio');
			for (var i = 0; i < field.labels.length; i++) {
				var label = field.labels[i];
				var value = field.values[i];
				var lid = field.name + '_' + value;
				var child = $('<input/>')
					.attr('type','radio')
					.attr('id',lid)
					.attr('name',field.name)
					.addClass(field.class)
					.val(value);
				input
					.tag('li')
					.append(child)
					.tag('label').attr('for',lid).text(label).gat()
				.gat();
				if (inputs)
					if (inputs[field.name])
						inputs[field.name].push(child);
					else
						inputs[field.name] = [child];
			}
		} else if (field.type == 'hidden') {
			input = $('<input/>').attr('id', field.name).attr('type', field.type);

			for (var n in field) {
				if (n == 'value')
					input.val(field.value);
				else
					input.attr(n, field[n]);
			}
			if (inputs)
				inputs[field.name] = input;
		}

		return input;
	};

	// 仕様から入力フィールドを生成
	var traverse = function(fieldset, field, inputs) {
		if (!field) return;
		if (field.type == 'group') {
			fieldset = fieldset.tag('div').addClass('group').tag('h3').text(field.label).gat().tag('div').addClass('inner');
			var cs = inputs[field.name] = {};
			var fields = field.fields;
			for (var i = 0; i < fields.length; i++) {
				var cf = fields[i];
				traverse(fieldset, cf, cs);
			}
			fieldset = fieldset.gat().gat();
		} else if (field.type == 'array') {
			var cur = fieldset.tag('div').addClass('array')
				.tag('label').text(field.label).gat()
				.tag('div');
			var cs = inputs[field.name] = [];
			cs.addPart = function() {
				var ccs = createInput(field.field);
				cs.push(ccs);
				cur.tag('p')
					.append(ccs)
					.tag('button').addClass('icon ng')
						.click(function() {
							cs.removePart(ccs);
							$(this).parent().remove();
							return false;
						})
					.gat()
					.gat();
				return false;
			};
			cs.removePart = function(ccs) {
				for (var i = 0; i < cs.length; i++) {
					if (cs[i] == ccs) {
						cs.splice(i,1);
						break;
					}
				}
				return false;
			};
			cur.tag('button').addClass('icon ok').click(cs.addPart).gat();
			cur.gat().gat();
		} else if (field.type == 'multiple') {
			var cur = fieldset.tag('div').addClass('multiple').tag('h3').text(field.label).gat().tag('div').addClass('inner');
			var cs = inputs[field.name] = [];
			cs.addPart = function() {
				cur = cur.tag('p').addClass('unit');
				var ccs = {};
				var cidx = cs.length;
				cs.push(ccs);
				cur.tag('button').data('ccs', ccs).addClass('icon ng').click(function() {
					cs.removePart($(this).data('ccs'));
					$(this).parent().remove();
				}).gat();
				for (var n in field.fields) {
					traverse(cur, field.fields[n], ccs);
				}
				cur.data('input',ccs);
				cur = cur.gat();
				return false;
			};
			cs.removePart = function(ccs) {
				for (var i=0; i < cs.length; i++) {
					if (cs[i] === ccs) {
						cs.splice(i,1);
						break;
					}
				}
			};
			cur.tag('button').addClass('icon ok').click(cs.addPart).gat();
			cur.sortable({
				stop:function(e,ui) {
					// 配列初期化
					cs = inputs[field.name] = [];
					var list = cur.find('p.unit');
					list.each(function(unit,element) {
						// リスト投入しなおし
						cs.push($(this).data('input'));
					});
				}
			})
			.gat().gat();
		} else {
			var input = createInput(field, inputs);
			if (field.type == 'hidden') {
				fieldset.append(input);
			} else {
				if (field.longlabel) {
					var p = $('<p/>').tag('label').attr('for', field.name).addClass('long').text(field.label).gat().append(input);
				} else {
					var p = $('<p/>').tag('label').attr('for', field.name).text(field.label).gat().append(input);
				}
				fieldset.append(p);
			}
		}
	};

	for (var i = 0; i < spec.fields.length; i++) {
		traverse(fieldset, spec.fields[i], self.inputs);
	}

	// ボタンフィールドの生成
	var buttons = fieldset.tag('p').addClass('buttons');
	var oklabel = (spec.oklabel) ? spec.oklabel : '実行';
	buttons
		.append($("<button type='submit' />").addClass('ok').text(oklabel))
		.append($("<button type='button' />").addClass('cancel').click(hideForm).text('キャンセル'))
		.gat();

	fieldset.gat();

	if (!spec.class) {

		element.validate();
	} else if (spec.class.indexOf('file') >= 0) {
		// ファイルアップロード
		element
		.attr('enctype', 'multipart/form-data')
		.ajaxForm({
			success: function(responseText, statusText, xhr, $form) {
				// ライブラリからerrorで処理が返らないので、全部successで受けてます
				hideForm();
				Admin.client.showStat(responseText);
				return false;
			}
		});

	// Socket Form の場合は、検証およびソケット送信を有効にする
	} else if (spec.class.indexOf('socket') >= 0) {
		element.validate({
			submitHandler: function(form) {
				function toVal(i) {
					if (i.hasClass('date') || i.hasClass('datetime')) {
						if (i.val()) {
							var d = i.datepicker('getDate');
							d.setSeconds(0);
							d.setMilliseconds(0);
							return d.getTime();
						} else {
							return undefined;
						}
					} if (i.hasClass('number') || i.hasClass('int')) {
						return Number(i.val());
					} else if (i.hasClass('boolean')) {
						return Boolean(i.val() === 'true');
					} else if (i.hasClass('json')) {
						return jQuery.parseJSON(i.val());
					} else {
						return i.val();
					}
				}
				function toObj(i) {
					if (i.val != null && i.val.constructor.name == 'Function') {
						if ((i.attr('type') == 'checkbox' || i.attr('type') == 'radio') && !i.attr('checked'))
							return null;
						return toVal(i);
					} else if (i.constructor.name == 'Array') {
						var o = [];
						for (var n = 0; n < i.length; n++) {
							var input = i[n];
							if (input.attr && input.attr('type') === 'radio') {
								if (input.attr('checked')) {
									return toVal(input);
								} else {
									o = undefined;
								}
							} else {
								var obj = toObj(i[n]);
								if (obj)
									o.push(obj);
							}
						}
						return o;
					} else if (i.constructor.name == 'Object') {
						var o = {};
						for (var n in i) {
							o[n] = toObj(i[n]);
						}
						return o;
					}
				};
				try {
					var obj = toObj(self.inputs);
					var method = form.action.substr(form.action.lastIndexOf('/')+1);

					if (self.options.onSubmit) {
						// オプションハンドラが有る場合は、そこを呼ぶ
						self.options.onSubmit(obj);
						if (!self.options.wait) {
							// 処理待ちしない場合
							hideForm();
						}
					} else {
						// 通常はクライアントを使って送信
						Admin.client.send(method, obj);
					}
					// ボタン無効化
					$(form).find('button[type=submit]').attr('disabled','true');
				} catch (e) {
					showError(e);
				}
				return false;
			}
		});
	}
	self.element = element;
	self.spec = spec;
};

Form.prototype.apply = function(values) {

	var _apply = function(input, value) {
		if (input.val != null && input.val.constructor.name == 'Function') {

			if (input.hasClass('date') || input.hasClass('datetime')) {
				input.datepicker('setDate', new Date(Number(value)));
			} else if (input.hasClass('json')) {
				input.val(JSON.stringify(value));
			} else {
				input.val(value);
			}

		} else if (input.constructor.name == 'Array') {
			if (input.addPart != null) {
				for (var i = 0; i < value.length; i++) {
					input.addPart();
				}
			}
			for (var i = 0; i < input.length; i++) {
				var ci = input[i];
				if (ci.attr && ci.attr('type') === 'checkbox') {
					for (var j = 0; j < value.length; j++) {
						if (ci.val() == String(value[j])) {
							ci.attr('checked', 'checked');
						}
					}
				} else if (ci.attr && ci.attr('type') === 'radio') {
					if (ci.val() == String(value)) {
						ci.attr('checked', 'checked');
					}
				} else {
					var cv = value[i];
					if (ci && cv) {
						_apply(ci, cv);
					}
				}
			}
		} else {
			for (var n in value) {
				var ci = input[n];
				var cv = value[n];
				if (ci && cv)
					_apply(ci, cv);
			}
		}
	};

	for (var n in values) {
		var input = this.inputs[n];
		var value = values[n];
		if (input && value)
			_apply(input, value);
	}
};

Form.prototype.appendTo = function(target) {
};

// Form Specifications
Admin.FormSpecs = {
	// ログタイプアップロード
	upload: {
		title: 'ファイルアップロード',
		desc: '発射よーい',
		method: 'post',
		action: '/upload',
		class: 'file',
		oklabel: 'アップロード',
		fields: [
			{
				type: 'file',
				name: 'upload',
				label: 'ファイル'
			},
			{
				type: 'text',
				name: 'colname',
				label: '対象テーブル',
				readonly: true
			},
			{
				type: 'radio',
				name: 'clean',
				label: 'データクリア',
				labels: ['する','しない'],
				values: [true,false],
				disabled: true
			},
			{
				type: 'text',
				name: 'selector',
				label: 'セレクタ',
				readonly: true
			},
			{
				type: 'text',
				name: 'name',
				label: '種類名',
				disabled: true
			},
			{
				type: 'text',
				name: 'category',
				label: 'カテゴリ',
				readonly: true
			}
		]
	},
	// ファイルダウンロード
	download: {
		title: 'ファイルダウンロード',
		desc: '撃ち落せー',
		method: 'post',
		action: '/download',
		oklabel: 'ダウンロード',
		fields: [
			{
				type: 'text',
				name: 'colname',
				label: '対象テーブル',
				readonly: true
			},
			{
				type: 'text',
				name: 'name',
				label: '種類名',
				disabled: true
			},
			{
				type: 'text',
				name: 'selector',
				label: 'セレクタ',
				readonly: true
			},
			{
				type: 'text',
				name: 'sort',
				label: 'ソート順',
				readonly: true
			}
		]
	}
};

// フォーム表示
function showForm(name, obj, overwrite, options) {
	if (form && !overwrite) hideForm();
	form = new Form(name);
	if (obj) form.apply(obj);
	if (options) form.options = options;
	jQuery.facebox(form.element);
};

function hideForm() {
	$(document).trigger('close.facebox');
	form = null;
	return false;
};


$.validator.messages = {
	required: "この項目は必須です",
	remote: "項目を修正してください",
	email: "正しいメールアドレスを入力してください",
	url: "正しいURLを入力してください",
	date: "正しい日付を入力してください",
	dateISO: "正しいISO形式の日付を入力してください",
	number: "数値を入力してください",
	digits: "数字を入力してください",
	creditcard: "正しいクレジットカード番号を入力してください",
	equalTo: "内容が一致していません",
	accept: "Please enter a value with a valid extension.",
	maxlength: $.validator.format("{0}文字以内で入力してください"),
	minlength: $.validator.format("{0}文字以上で入力してください"),
	rangelength: $.validator.format("{0}文字から{1}文字の間で入力してください"),
	range: $.validator.format("{0}から{1}の間で入力してください"),
	max: $.validator.format("{0}以下の値を入力してください"),
	min: $.validator.format("{0}以上の値を入力してください")
};

