
var error  = null;
var stat   = null;
var form   = null;
(function ($) {
	// JSDefferdの初期化
	Deferred.define();

	// 管理コンソール内で利用するグローバル変数
	var Admin = {};

	// 通信クライアント
	Admin.client = null;

	Admin.user = null;

	/**
	 * ゼロ埋め
	 * @param {} num
	 * @param {} zero
	 * @returns {}
	 */
	function zero(num, zero) {
		var str = String(num);
		while (str.length < zero) {
			str = '0' + str;
		}
		return str;
	}

	/**
	 * 日付フォーマット
	 * @param date
	 * @return
	 */
	Admin.formatDate = function (date) {
		if (date) {
			if (typeof date == 'string') {
				date = new Date(date);
			}
			return date.getFullYear()
				+ '-'
				+ zero((date.getMonth()+1),2)
				+ '-'
				+ zero(date.getDate(),2)
				+ ' '
				+ zero(date.getHours(),2)
				+ ':'
				+ zero(date.getMinutes(),2)
				+ ':'
				+ zero(date.getSeconds(),2)
			;
		} else {
			return '';
		}
	};

	// ナビメニュータブのアクティベート
	Admin.activateNav = function(type) {
		$('nav').find('li').each(function() {
			var istype = $(this).hasClass(type);
			if (istype)
				$(this).addClass('active');
			else
				$(this).removeClass('active');
		});
	};

	$(function() {
		// DomReadyなバインドはここで設定

		// 通信クライアント
		Admin.client = new Client();

		// メニュー選択時
		$('.menu').click(function(e) {
			e.preventDefault();
			var menu = $(this).data('menu');
			Admin.client.list(menu, {selector :{} ,size:100});
			// ページ状態の保存
			location.hash = '#!menu=' + menu;
			return false;
		});

		// ハッシュチェンジイベント
		window.onhashchange = function() {
			if(location.hash) {
				// ページ状態の取得
				var menu = location.hash.match(/#!menu=([a-z]+)/)[1];
				Admin.client.list(menu, {selector :{} ,size:100});
				return false;
			}
		};

		// WebSocket送信用フォームの検証と実行を設定
		$('form.socket').validate({
			submitHandler: function(form) {
				var obj = {};
				var array = $(form).serializeArray();
				for (var i = 0; i < array.length; i++) {
					var o = array[i];
					obj[o.name] = o.value;
				}
				var method = form.action.substr(form.action.lastIndexOf('/')+1);
				Admin.client.send(method, obj);
				// ボタン無効化
				$(form).find('button[type=submit]').attr('disabled','true');
				return false;
			}
		});

	});

	window.Admin = Admin;

})(jQuery);
