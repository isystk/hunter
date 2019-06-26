(function () {

var MAP_IMAGE = '/img/map0.gif';
var HUMAN_IMAGE = '/img/chara5.gif';
var MONSTER_IMAGE = '/img/chara6.gif';
var ICON_IMAGE = '/img/icon0.gif';
var BOMB_IMAGE = '/img/effect0.gif';
var BOMB_SE = '/sound/bomb1.wav';

enchant();

/**
 * アクタークラス
 * @param {ActorType} actorType アクタータイプ
 * @param {String} name 名前
 * @param {Image} avatarImage アバター画像
 * @param {Image} avatarPosition アバター画像
 * @param {Number} x x座標
 * @param {Number} y y座標
 * @param {String} talk 会話
 */
var Actor = Class.create(Group, {
	initialize: function(id, actorType, name, avatarImage, avatarPosition, x, y, talk){
		Group.call(this);
		this.id = id;
		this.actorType = actorType;
		
		this.name = new Label(name);
		this.name.x = -150;
		this.name.y = 5;
		this.addChild(this.name);

		this.talk = new Label();
		this.talk._element.setAttribute('class', 'talk');
		this.talk.x = -50;
		this.talk.y = -45;
		this.talk.width = 100;
		if (talk && talk !== '') {
			this.talk.text = talk;
			this.addChild(this.talk);
		}
		
		this.avatar = new Sprite(32, 32);
		var image = new Surface(96, 128);
		image.draw(avatarImage, avatarPosition, 0, 96, 128, 0, 0, 96, 128);
		this.avatar.image = image;
		this.avatar.x = -16;
		this.avatar.y = -24;
		this.addChild(this.avatar);
		
		this.x = x;
		this.y = y;
		this.nx = this.nnx = this.x;
		this.ny = this.nny = this.y;
		this.speed = 3;
		this.direction = 0;
		this.walk = [1, 0, 1, 2];
		this.anime = 0;
		this.frameWait = 4;
		this.frameCount = 0;
		this.invincible = false;
		this.updateFrame();
		
		this.addEventListener(Event.ENTER_FRAME, function(){
			if (this.x == this.nx && this.y == this.ny) {
				this.nx = this.nnx;
				this.ny = this.nny;
			}
			if (this.x == this.nx && this.y == this.ny) {
				if (this.anime !== 0) {
					this.anime = 0;
					this.updateFrame();
				}
				this.frameCount = 0;
			} else {
				var vx = this.nx - this.x;
				var vy = this.ny - this.y;
				var dist = Math.sqrt(vx * vx + vy * vy);
				var dx = Math.floor(this.speed * vx / dist);
				var dy = Math.floor(this.speed * vy / dist);
				if (Math.abs(dx) > Math.abs(vx)) {
					dx = vx;
				}
				if (Math.abs(dy) > Math.abs(vy)) {
					dy = vy;
				}
				this.moveBy(dx, dy);
				
				if (++this.frameCount == this.frameWait) {
					if (Math.abs(vx) > Math.abs(vy)) {
						this.direction = (vx > 0) ? 2 : 1;
					} else {
						this.direction = (vy > 0) ? 0 : 3;
					}
					++this.anime;
					this.anime %= this.walk.length;
					this.updateFrame();
					this.frameCount = 0;
				}
			}
			if(this.invincible){
				// 点滅
				if(this.avatar.scaleX){
					this.avatar.scaleX = 0;
				}else{
					this.avatar.scaleX = 1;
				}	
			}else if(!this.avatar.scaleX){
				this.avatar.scaleX = 1;
			}
		});
	},
	updateFrame: function(){
		this.avatar.frame = this.direction * 3 + this.walk[this.anime];
	},
	setNextPos: function(x, y, nx, ny){
		if (typeof nx != 'undefined' && typeof ny != 'undefined') {
			this.nx = Math.floor(x);
			this.ny = Math.floor(y);
			this.nnx = Math.floor(nx);
			this.nny = Math.floor(ny);
		}else{
			this.nx = this.nnx = Math.floor(x);
			this.ny = this.nny = Math.floor(y);
		}
		this.talk.text = '';
		this.removeChild(this.talk);
	},
	warpTo: function(x, y){
		this.x = this.nx = this.nnx = x;
		this.y = this.ny = this.nny = y;
		if (this.anime !== 0) {
			this.anime = 0;
			this.updateFrame();
		}
		this.frameCount = 0;
	},
	setMessage: function(text){
		this.talk.text = text;
		this.addChild(this.talk);
	}
});

/**
 * プレイヤークラス
 * @param {Number} id アクターID
 * @param {ActorType} actorType アクタータイプ
 * @param {String} name 名前
 * @param {Image} avatarImage アバター画像
 * @param {Image} avatarPosition アバター画像
 * @param {Number} x x座標
 * @param {Number} y y座標
 */
var Player = Class.create(Actor, {
	initialize: function(id, actorType, name, avatarImage, avatarPosition, x, y, talk){
		Actor.call(this, id, actorType, name, avatarImage, avatarPosition, x, y, talk);
		this.map = null;
		this.dirty = false;
	},
	setMap: function(map){
		this.map = map;
	},
	moveBy: function(dx, dy){
		if (this.map) {
			// 当たり判定
			if (this._movable(dx, dy)) {
				Actor.prototype.moveBy.call(this, dx, dy);
			}else if(this._movable(dx, 0)){
				// 壁滑り
				Actor.prototype.moveBy.call(this, dx, 0);
			}else if(this._movable(0, dy)){
				// 壁滑り
				Actor.prototype.moveBy.call(this, 0, dy);
			}else{
				// 動けない
				this.nx = this.x;
				this.ny = this.y;
			}
		} else {
			Actor.prototype.moveBy.call(this, dx, dy);
		}
		this.dirty = true;
	},
	_movable: function(dx, dy){
		var x = this.x + (dx ? dx / Math.abs(dx) : 0) * 9;
		var y = this.y + (dy ? dy / Math.abs(dy) : 0) * 9;
		return 0 <= x && x < this.map.width && 0 <= y && y < this.map.height && !this.map.hitTest(x, y);
	}
});

/**
 * アイテムクラス
 * @param {ActorType} itemType アイテムタイプ
 * @param {String} name 名前
 * @param {Number} x x座標
 * @param {Number} y y座標
 */
var Item = Class.create(Group, {
	initialize: function(id, itemType, name, x, y){
		Group.call(this);
		this.id = id;
		this.itemType = itemType;
		
		this.name = new Label(name);
		this.name.x = -140;
		this.name.y = 20;
		this.addChild(this.name);

		this.icon = new Sprite(16, 16);
		this.icon.image = enchant.Game.instance.assets[ICON_IMAGE];
		this.icon.frame = itemType;
		this.addChild(this.icon);
		
		this.x = x;
		this.y = y;
		this.nx = this.nnx = this.x;
		this.ny = this.nny = this.y;
		this.speed = 3;
		this.direction = 0;
		this.walk = [1, 0, 1, 2];
		this.anime = 0;
		this.frameWait = 4;
		this.frameCount = 0;
	}
});

/**
 * ゲームマネージャクラス
 * @param {Game} game ゲームオブジェクト
 * @param {Group} stage ステージノード
 */
var GameManager = Class.create({
	initialize: function(game, stage){
		this.game = game;
		this.stage = stage;
		this.actors = {};
		this.items = {};
		this.score = undefined;
		this.level = undefined;
		this.totalScore = undefined;
	},
	add: function(actor, Type, invincible){
		var avatarImage;
		var avatarPosition;
		if (actor.actorType === App.Const.ActorType.HUMAN) {
			avatarImage = this.game.assets[HUMAN_IMAGE];
			avatarPosition = 32;
		} else if (actor.actorType === App.Const.ActorType.SLIME) {
			avatarImage = this.game.assets[MONSTER_IMAGE];
			avatarPosition = 32;
		} else if (actor.actorType === App.Const.ActorType.MAGICIAN) {
			avatarImage = this.game.assets[MONSTER_IMAGE];
			avatarPosition = 64;
		}
		var newActor = new Type(
			actor.id, 
			actor.actorType,
			actor.name,
			avatarImage,
			avatarPosition,
			actor.x,
			actor.y,
			actor.talk);
		this.stage.addChild(newActor, this.stage.lastChild);
		this.actors[newActor.id] = newActor;
		if(invincible){
			// しばらく無敵
			newActor.invincible = true;
			setTimeout(function(){
				newActor.invincible = false;
			}, 3000);
		}

		if (Type === Player) {
			// スコアの表示
			this.scoreLabel = new ScoreLabel();
			this.game.rootScene.addChild(this.scoreLabel);
			this.scoreLabel.score = 0;
	
			// レベルの表示
			this.levelLabel = new LevelLabel();
			this.levelLabel.x = 150;
			this.game.rootScene.addChild(this.levelLabel);
			this.levelLabel.level = actor.level;

			// 合計ポイントの表示
			this.totalLabel = new TotalLabel();
			this.totalLabel.x = 300;
			this.game.rootScene.addChild(this.totalLabel);
			this.totalLabel.total = actor.totalScore;
		}

		return newActor;
	},
	remove: function(id){
		if(id in this.actors){
			this.stage.removeChild(this.actors[id]);
			delete this.actors[id];
		}
	},
	removeAll: function(){
		for(var id in this.actors){
			this.stage.removeChild(this.actors[id]);
			delete this.actors[id];
		}
	},
	move: function(id, x, y, nx, ny){
		if(id in this.actors){
			this.actors[id].setNextPos(x, y, nx, ny);
		}
	},
	talk: function(id, text){
		if(id in this.actors){
			this.actors[id].setMessage(text);
		}
	},
	hit: function(id, x, y){
		if(id in this.actors){
			// 爆発エフェクト
			var actor = this.actors[id];
			var effect = new Sprite(16, 16);
			effect.image = this.game.assets[BOMB_IMAGE];
			effect.x = actor.x - 8;
			effect.y = actor.y - 8;
			var self = this;
			effect.addEventListener(Event.ENTER_FRAME, function(){
				if(self.game.frame % 4 === 0 && ++this.frame === 5){
					self.stage.removeChild(this);
				}
			});
			this.stage.addChild(effect);
			var sound = this.game.assets[BOMB_SE].clone();
			sound.play();
			// ワープ
			actor.warpTo(x, y);
		}
	},
	hitTest: function(player){
		for(var i in this.actors){
			if(i == player.id){
				continue;
			}
			var actor = this.actors[i];
			if(actor.actorType === App.Const.ActorType.HUMAN || actor.invincible){
				continue;
			}
			if(Math.abs(actor.x - player.x) < 16 && Math.abs(actor.y - player.y) < 16){
				return parseInt(i);
			}
		}
		return 0; // falseを意味する
	},
	addItem: function(item){
		var newItem = new Item(
			item.id, 
			item.itemType,
			item.name,
			item.x,
			item.y);
		this.stage.addChild(newItem, this.stage.lastChild);
		this.items[item.id] = newItem;
		return newItem;
	},
	getItemTest: function(player){
		for(var i in this.items){
			var item = this.items[i];
			if(Math.abs(item.x - player.x) < 16 && Math.abs(item.y - player.y) < 16){
				return parseInt(i);
			}
		}
		return 0; // falseを意味する
	},
	removeItem: function(id){
		if(id in this.items){
			this.stage.removeChild(this.items[id]);
			delete this.items[id];
		}
	},
	removeItemAll: function(){
		for(var id in this.items){
			this.stage.removeChild(this.items[id]);
			delete this.items[id];
		}
	},
	upScore: function(data){
		this.scoreLabel.score = data.score;
		this.totalLabel.total = data.totalScore;
	}
});


window.onload = function() {

	var game = undefined;
	if (App.isSmartPhone()) {
		game = new Game(320, 320);
	} else {
		game = new Game(640, 480);
	}

	game.fps = 30;
	game.preload(MAP_IMAGE, HUMAN_IMAGE, MONSTER_IMAGE, ICON_IMAGE, BOMB_IMAGE, BOMB_SE);
	game.onload = function() {
		var map = new Map(16, 16);
		map.image = game.assets[MAP_IMAGE];
		map.loadData(App.Map.backgroundMap, App.Map.fourgroundMap);
		map.collisionData = App.Map.collisionData;

		var stage = new Group();
		stage.addChild(map);
		game.rootScene.addChild(stage);
	
		var gameManager = new GameManager(game, stage);
		
		// サーバーに接続
		App.client = new Client();

		Handler.prototype.game = {};
	
		// 初期化処理
		Handler.prototype.game.init = function(data){
			// ゲーム上にアクターを表示する
			gameManager.removeAll();
			var actors = data.actors;
			for (var key in actors) {
				var actor = actors[key];
				// console.log('ActorAdd: ' + actor.actorType + ', ' + actor.name + ', ' + actor.x + ', ' + actor.y);
				if (actor.actorType === App.Const.ActorType.HUMAN) {
					gameManager.add(actor, Actor, true);
				}
				else {
					gameManager.add(actor, Actor, false);
				}
			}
			// ゲーム上にアイテムを表示する
			gameManager.removeItemAll();
			var items = data.items;
			for (var key in items) {
				var item = items[key];
				gameManager.addItem(item);
			}
		};

		// 自分がゲームに参加した場合
		Handler.prototype.game.actorJoin = function(data) {
	
			var actor = data.actor;

			var player = gameManager.add(actor, Player, true);
			
			player.setMap(map);
			map.touchEnabled = true;
			map.addEventListener(Event.TOUCH_START, function(e){
				player.setNextPos(e.localX, e.localY);
			});
			game.rootScene.addEventListener(Event.ENTER_FRAME, function(e){
				var x = Math.min((game.width - 16) / 2 - player.x, 0);
				var y = Math.min((game.height - 16) / 2 - player.y, 0);
				x = Math.max(game.width, x + map.width) - map.width;
				y = Math.max(game.height, y + map.height) - map.height;
				stage.x = x;
				stage.y = y;
				
				if (player.actorType === App.Const.ActorType.HUMAN) {
					var hit = gameManager.hitTest(player);
					if (hit) {
						console.log('hit!');
						App.client.send('game.actorHit', hit);
						game.end();
					}
					var getItem = gameManager.getItemTest(player);
					if (getItem) {
						console.log('getItem!');
						App.client.send('game.getItem', {itemId: getItem});
					}
				}
			});
			setInterval(function(){
				if (player.dirty) {
					App.client.send('game.actorMove', {x:player.x, y:player.y, nx:player.nx, ny:player.ny});
					player.dirty = false;
				}
			}, 300);
		};
			
		//  自分以外のプレイヤーがゲームに参加した場合
		Handler.prototype.game.actorAdd = function(data){
			var actors = data.actors;
			for (var key in actors) {
				var actor = actors[key];
				// console.log('ActorAdd: ' + actor.actorType + ', ' + actor.name + ', ' + actor.x + ', ' + actor.y);
				if (actor.actorType === App.Const.ActorType.HUMAN) {
					gameManager.add(actor, Actor, true);
				}
				else {
					gameManager.add(actor, Actor, false);
				}
			}
		};
	
		// プレイヤーが退場した
		Handler.prototype.game.actorRemove = function(data){
			// console.log('ActorRemove: ' + data.id);
			gameManager.remove(data.id);
		};
		
		// プレイヤー移動した
		Handler.prototype.game.actorMove = function(data){
			var actors = data.actors;
			for (var key in actors) {
				var actor = actors[key];
				// console.log('ActorMove: ' + actor.id + ', ' + actor.x + ', ' + actor.y + ', ' + actor.nx + ', ' + actor.ny);
				gameManager.move(actor.id, actor.x, actor.y, actor.nx, actor.ny);
			}
		};
		
		// プレイヤーが攻撃を受けた
		Handler.prototype.game.actorHit = function(data){
			// console.log('ActorHit: ' + data.id + ', ' + data.x + ', ' + data.y);
			gameManager.hit(data.id, data.x, data.y);
		};
	
		// チャットを受信した
		Handler.prototype.game.actorTalk = function(data){
			// console.log('ActorTalk: ' + data.id + ', ' + data.text);
			gameManager.talk(data.id, data.text);
		};
			
		// エリア上にアイテムを追加する
		Handler.prototype.game.addItem = function(data){
			var items = data.items;
			for (var key in items) {
				var item = items[key];
				gameManager.addItem(item);
			}
		};
			
		// アイテムを削除する
		Handler.prototype.game.removeItem = function(data){
			gameManager.removeItem(data.itemId);
		};

		// プレイヤーがアイテムを取得した
		Handler.prototype.game.getItem = function(data){
			gameManager.upScore(data);
		};
	};

	game.start();
	App.game = game;
};

})();

