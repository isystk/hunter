 /**
 * 通信クライアント
 * @constructor
 */
var Client = function() {
	this.handler = new Handler();
	this.open();
};

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

/**
 * 接続オープン
 */
Client.prototype.open = function() {
	var self = this;
	self.showHeadStat('サーバーに接続しています ' + location.host + '...');
	this.ws = io.connect('ws://' + location.host + '/', {port : 9001});

	this.ws.on('connect', function() {
		//Fired when the connection is established and the handshake successful.
		self.showHeadStat('サーバーに接続しました [' + location.host + ']');
		if (Admin.user) {
			self.send('admin.loginSession', {userId: Admin.user.id, session: Admin.user.session});
		} else if ($.cookie('ai') && $.cookie('as')) {
			self.send('admin.loginSession', {userId: $.cookie('ai'), session: $.cookie('as')});
		}
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
	});

	this.ws.on('disconnect', function(e) {
		self.showHeadStat('Disconnect - ' + e);
		//self.showError('サーバーから切断されました。');
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
Client.prototype.send = function(method, obj, callback) {
	var self = this;
	if (this.ws.socket.connected) {
		if (callback !== null) {
			if(!Admin.callId) {
				Admin.callId = 0;
			}
			if(!Admin.callbacks) {
				Admin.callbacks = [];
			}
			obj._req = ++Admin.callId;
			Admin.callbacks[Admin.callId] = callback;
		}
		var json = JSON.stringify(obj);
		this.ws.send(method + ':' + json);
	} else {
		self.showError('サーバーから切断されています');
	}
};

/**
 * 一覧取得
 *  - format data={selector: Object, page: int, size: int};
 * @param {String} type
 * @param {Object} data データ
 */
Client.prototype.list = function(type, data) {
	this.send(type + '.list', { selector:data.selector, page:data.page, size:data.size });
};

/**
 * 保存
 * @param {} type
 * @param {} data
 */
Client.prototype.save = function(type, data) {
	this.send(type + '.save', data);
};

/**
 * 削除
 * @param {} type
 * @param {} selector
 */
Client.prototype.remove = function(type, selector) {
	this.send(type + '.remove', selector);
};


