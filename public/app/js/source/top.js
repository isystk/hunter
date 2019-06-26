Handler.prototype.top = {};

// メッセージ
Handler.prototype.top.message = function(data){
	$.message({
		text: data.message
	});
};

// 接続中のユーザーを表示する。
Handler.prototype.top.memberList = function(data){
	var joinMember = _.filter(data.memberList, function(member){ return member.game && member.game.isJoin; });
	var count = joinMember.length;
	$('#playerCount')
		.empty()
		.text('利用中のユーザー:'+count+ '人');
};

// ログイン
Handler.prototype.top.login = function(res){
	// ユーザーエリア
	$('#userArea')
		.empty()
		.tag('div')
			.tag('ul')
				.tag('li')
					.tag('img').attr('src', res.image).attr('width', '30').gat()
				.gat()
				.tag('li')
					.tag('label').text(' '+res.name+'さん ').gat()
				.gat()
				.tag('li')
					.tag('a').attr('href', '#').click(function() {
							$.cookie('id',null,{path:"/"});
							location.href = '/logout/';
						})
						.text('ログアウト')
					.gat()
				.gat()
			.gat()
		.gat()
	.gat();

	// ボタン
	$('#buttonArea')
		.empty()
		.tag('ul').addClass('button')
			.tag('li')
				.tag('selection').addClass('red')
					.tag('p').attr('id', 'startBtn')
						.tag('button').width('150px').text('ゲームを始める')
							.click(function () {
								// ゲームを開始する
								App.client.send('game.actorJoin', {});
								// チャット入力欄を入力可能にする
								$('#talkInput').removeAttr('disabled');
								// ボタンを非表示にする
								$('#startBtn').hide();
								$('#endBtn').show();
							})
						.gat()
					.gat()
					.tag('p').attr('id', 'endBtn')
						.tag('button').width('150px').text('ゲームを終了する')
							.click(function () {
//								// ゲームを終了する
//								App.client.send('game.actorRemove', {});
//								// チャット入力欄を入力可能にする
//								$('#talkInput').attr('disabled', 'disabled');
//								// ボタンを非表示にする
//								$('#endBtn').hide();
//								$('#startBtn').show();
								location.reload();
							})
						.gat()
						.hide()
					.gat()
				.gat()
			.gat()
		.gat();
};

// ロード時の画面描画
$(function() {

	if (App.isSmartPhone()) {
		$('.content').css('width', '320px');
	}

	// ログインボタンを表示
	$('#buttonArea')
		.tag('ul').addClass('button')
			.tag('li')
				.tag('a').attr('href', '/auth/twitter/').attr('data-ajax', false)
					.tag('selection').addClass('blue')
						.tag('p').tag('button').width('150px').text('Twitter でログイン').gat().gat()
					.gat()
				.gat()
			.gat()
			.tag('li')
				.tag('a').attr('href', '/auth/fb/').attr('data-ajax', false)
					.tag('selection').addClass('blue')
						.tag('p').tag('button').width('150px').text('Facebook でログイン').gat().gat()
					.gat()
				.gat()
			.gat()
		.gat()
	;

	// チャット用の入力ボックス
	$('#talkInput').attr('disabled', 'disabled');
	$('#talkInput').click(function() {
		$(this).focus();
	});
	$('#talkInput').keypress(function (e) {
		if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
			App.client.send('game.actorTalk', {text: $(this).val()});
			$(this).val('');
		}
	});

	// 画面を下までスクロールした際にランキングを表示する
	// ランキングを表示する。
	(function () {
		var nowLoding = false;
		var max = undefined;
		$(window).bottom({proximity: 1.5});
		$(window).bind("bottom", function() {
			if (!App.client || !App.client.connected || nowLoding) {
				console.log('Now Loading...');
				return;
			}
			var index = $('#rankingArea').find('.notice').length;
			if (max !== undefined && max <= index) {
				return;
			}
			nowLoding = true;
			App.client.send('top.getRanking', {index: index});
		});
		Handler.prototype.top.getRanking = function(data){
			var ranking = data.ranking;
			max = data.max;
			$('#rankingArea')
				.exec(function () {
					var self = (this);
					for (var i=0, len=ranking.length; i<len; i++) {
						var user = ranking[i];
						var url = '#';
						if (App.Const.SnsType.TWITTER === user.snsType) {
							url = 'http://twitter.com/'+user.screenName;
						}
						else if (App.Const.SnsType.FACEBOOK === user.snsType) {
							url = 'http://www.facebook.com/'+user.screenName;
						}
						self.tag('div').attr('class', 'notice')
								.tag('a').attr('href', url).attr('target', '_blank')
									.tag('img').attr('class', 'user').attr('src', user.image).gat()
								.gat()
								.tag('div').css('float', 'right').css('text-align', 'center').css('font-size', '2.4em').css('margin-left', '1em')
									.tag('b').text(user.rank).gat()
								.gat()
								.tag('div').attr('class', 'userInfo')
									.tag('b').text(user.name + ' / ').gat()
									.tag('a').attr('href', url).attr('target', '_blank').text('@'+user.screenName).gat()
									.tag('br').gat()
									.tag('span').text('TOTAL SCORE:' + user.totalScore + ' / ' + 'HIGH SCORE:' + user.highScore).gat()
								.gat()
							.gat();
					}
				});
			nowLoding = false;
		};
	})();

	// ページトップに戻るボタンを表示
	(function () {
		var showFlug = false;
		var topBtn = $('#page-top');
		topBtn.css('bottom', '-100px');
		var showFlug = false;
		//スクロールが100に達したらボタン表示
		$(window).scroll(function () {
			if ($(this).scrollTop() > 100) {
				if (showFlug == false) {
					showFlug = true;
					topBtn.stop().animate({'bottom' : '20px'}, 200); 
				}
			} else {
				if (showFlug) {
					showFlug = false;
					topBtn.stop().animate({'bottom' : '-100px'}, 200); 
				}
			}
		});
		//スクロールしてトップ
		topBtn.click(function () {
			$('body,html').animate({
				scrollTop: 0
			}, 500);
			return false;
		});
	}());

	// ソーシャルボタンを表示
	setTimeout(function() {
		$('#socialArea')
			.tag('ul').attr('class', 'sns')
				.tag('li').attr('class', 'twitter')
					.tag('a')
						.attr('href', 'http://twitter.com/share')
						.attr('class', 'twitter-share-button')
						.data('url', location.href)
						.data('count', 'none')
						.data('lang', 'ja')
						.data('id', 'twitterLink')
					.gat()
					.exec(function() {
						$('body').append($('<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>'));
					})
				.gat()
				.tag('li').attr('class', 'google')
					.exec(function () {
						$('body').append($('<script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>'));
					})
					.append($('<g:plusone size="medium" annotation="none"></g:plusone>'))
				.gat()
				.tag('li').attr('class', 'mixi')
					.tag('div')
						.attr('data-plugins-type','mixi-favorite')
						.attr('data-service-key','6daca7c17646c33a32a0db16e9ef08bd06ddce01')
						.attr('data-size','medium')
						.attr('data-href', '')
						.attr('data-show-faces','false')
						.attr('data-show-count','false')
						.attr('data-show-comment','false')
						.data('width', '')
					.gat()
					.exec(function () {
						(function(d) {
							var s = d.createElement('script');
							s.type = 'text/javascript';
							s.async = true;
							s.src = 'http://static.mixi.jp/js/plugins.js#lang=ja';
							d.getElementsByTagName('head')[0].appendChild(s);
						})(document);
					})
				.gat()
				.tag('li').attr('class', 'facebook')
					.tag('div').attr('id', 'fb-root').gat()
					.exec(function () {
						(function(d, s, id) {
						  var js, fjs = d.getElementsByTagName(s)[0];
						  if (d.getElementById(id)) return;
						  js = d.createElement(s); js.id = id;
						  js.src = "http://connect.facebook.net/ja_JP/all.js#xfbml=1";
						  fjs.parentNode.insertBefore(js, fjs);
						}(document, 'script', 'facebook-jssdk'));
					})
					.tag('div')
						.attr('class', 'fb-like')
						.data('href', location.href)
						.data('send', 'false')
						.data('layout', 'button_count')
						.data('width', '100')
						.data('show-faces', 'true')
						.attr('id', 'fbLink')
					.gat()
				.gat()
			.gat();
	}, 1000);

	// ログイン済みの場合
	var id = $('#_id').val() || $.cookie('id');
	if (id && id !== '') {
		// cookie
		$.cookie('id', id);
		$('#_id').remove();
	}
});

