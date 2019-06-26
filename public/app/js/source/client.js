 /**
 * 通信クライアント
 * @constructor
 */
var Client = function() {
	this.handler = new Handler();
	this.open();
}

// ヘッダーステータス更新
Client.prototype.showHeadStat = function(msg) {
	//console.log(msg);
};

// ステータス表示
Client.prototype.showStat = function(msg) {
	$.notifyBar({
		html: msg,
		delay: 5000,
		close: true,
		animationSpeed: 'normal',
		cls: 'success'
	});
};

// エラー表示
Client.prototype.showError = function(err) {
	$.notifyBar({
		html: err,
		delay: 5000,
		close: true,
		animationSpeed: 'normal',
		cls: 'error'
	});
};

// 通信切断時
function disconnect() {
	var height = $(document).height() + 50;
	var width = $(window).width();

	$('body').append('<div id="blockView"/>');
	$('#blockView').addClass('disconnect').width(width+'px').height(height+'px')
		.append('<table><tr><td>サーバーとの接続が切断されました ...<br>少し時間をおいてから再度接続してください</td></tr></table>');

}

/**
 * 接続オープン
 */
Client.prototype.open = function() {
	var self = this;
	self.showHeadStat('サーバーに接続しています ' + location.host + '...');
	this.ws = io.connect('ws://' + location.host + '/', {port : 3000});

	this.ws.on('connect', function() {
		self.showHeadStat('サーバーに接続しました [' + location.host + ']');

		self.connected = true;

		// 通信切断表示を消す
		$('#blockView').remove();

		// 初期表示情報を取得します
		self.send('top.init', {});

		var id = $.cookie('id');
		if(id) {
			// ログイン処理
			self.send('top.login', {id: id});
		}

		// 9leapのStart表示を消す
		App.game.popScene();
	});

	this.ws.on('connecting', function(transport_type) {
		self.showHeadStat('接続タイプ : ' + transport_type);
	});

	this.ws.on('connect_failed', function(e) {
		self.showHeadStat('サーバーとの接続に失敗しました');
	});

	this.ws.on('message', function(message) {
		self.handler.invoke(message);
	});

	this.ws.on('close', function(e) {
		self.showHeadStat('サーバーとの接続が切断されました');
		disconnect();
	});

	this.ws.on('disconnect', function(e) {
		self.showHeadStat('Disconnect - ' + e);
		//self.showError('サーバーから切断されました。');
		disconnect();
	});

	this.ws.on('reconnect', function(transport_type, reconnectionAttempts) {
		self.showHeadStat('reconnect');
	});

	this.ws.on('reconnecting', function(reconnectionDelay, reconnectionAttempts) {
		self.showHeadStat('reconnecting');
	});

	this.ws.on('reconnect_failed', function(e) {
		self.showHeadStat('reconnect_failed');
	});
};

/**
 * サーバーへデータを送信
 * @param {String} method メソッド名　
 * @param {Object} obj データ
 */
Client.prototype.send = function(method, obj) {
	var self = this;
	if (this.ws.socket.connected) {
		var json = JSON.stringify(obj);
		this.ws.send(method + ':' + json);
	} else {
		self.showError('サーバーから切断されています');
	}
};


