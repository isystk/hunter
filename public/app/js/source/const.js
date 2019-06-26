/**
 * 定数
 * @constructor 
 */
function Const() {

	this.ActorType = {
		HUMAN: '1',
		SLIME: '2',
		MAGICIAN: '3'
	};

	this.ItemType = {
		STAR: '30'
	};

	this.SnsType = {
		TWITTER: '1',
		FACEBOOK: '2'
	};
}

// フロントサイド
if (typeof window !== 'undefined') {
	App.Const = new Const();
}
// サーバーサイド
else {
	module.exports = new Const();
}

