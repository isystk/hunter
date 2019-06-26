var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-11964840-5']);
_gaq.push(['_trackPageview']);

(function ($) {
	// Google Analytics設定
	(function () {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	// facebookのoauth認証でリダイレクト先に#_=_という文字列がURL付与される対応
	if (window.location.hash == '#_=_') {
		window.location.hash = '';
	}

	// JSDefferdの初期化
	Deferred.define();

	// アプリ内で利用するグローバル変数
	var App = {};

	// 通信クライアント
	App.client = undefined;

	// マップデータ
	App.backgroundMap = undefined;
	App.fourgroundMap = undefined;
	App.collisionData = undefined;

	// JSファイルをロードします。
	App.appendJsFile = function (path, callback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = path;
		script.onload = script.onreadystatechange = function() {
			if (!script.readyState || /loaded|complete/.test(script.readyState)) {
				script.onload = script.onreadystatechange = null;
				script = undefined;
				callback();
			}
		};
		document.body.appendChild(script);
	};

	// スマートフォンかそれ以外かを判別する。
	App.isSmartPhone = function() {
		var media = [
			'iPhone',
			//'iPad',
			'Android',
			'blackberry',
			'windowsPhone'
			/*Androidは'Android'という文字列だけで全てのAndroid端末を判別出来ないので注意*/
		];
		var pattern = new RegExp(media.join('|'), 'i');
		return pattern.test(navigator.userAgent);
	};

	$(function() {
		// DomReadyなバインドはここで設定
	});

	window.App = App;
})(jQuery);
