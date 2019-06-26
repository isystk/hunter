var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var Const = require('../public/app/js/source/const');
var config = require('../server/config');
var userService = require('../server/service/user');
var Deferred = require('jsdeferred').Deferred;
Deferred.define();

//passportのセッションを使うので
//リアライズ、デシリアライズのための関数を追記。
passport.serializeUser(function(user, done){
	done(null, user);
});
passport.deserializeUser(function(obj, done){
	done(null, obj);
});


passport.use(new TwitterStrategy({
		consumerKey: config.app.oauth.twitter.consumerKey,
		consumerSecret: config.app.oauth.twitter.consumerSecret,
		callbackURL: config.app.oauth.twitter.callbackUrl
	},
	function(accessToken, tokenSecret, profile, done) {
		passport.session.accessToken = accessToken;
		passport.session.profile = profile;
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

passport.use(new FacebookStrategy({
		clientID: config.app.oauth.facebook.appKey,
		clientSecret: config.app.oauth.facebook.secretKey,
		callbackURL: config.app.oauth.facebook.callbackUrl
	},
	function(accessToken, refreshToken, profile, done){
		passport.session.accessToken = accessToken;
		passport.session.profile = profile;
		process.nextTick(function(){
			done(null ,profile);
		});
	}
));

exports.gets = {
	'/' : function(req, res){
		var _id = '';
		if(req.session.user) {
			var user = req.session.user;
			console.log(user.userName+'さんが、ログインしました。id:['+user._id+']');
			_id = user._id;
		}

		res.render('index', {title: config.app.title, _id: _id, scripts: config.app.scripts, description: config.app.description});
	},
	'/logout/' : function(req, res){
		if(req.session.user) {
			var profile = req.session.user;
			console.log(profile.userName+'さんが、ログアウトしました。_id:['+profile._id+']');
			req.session.user = null;
		}
		res.redirect(config.app.host);
	},
	'/auth/twitter/' : [passport.authenticate('twitter'), function(req, res){}],
	'/auth/twitter/callback/' : [passport.authenticate('twitter', { failureRedirect: '/' }), function(req, res){
		next(function() {
			var deferred = new Deferred();
			var json = passport.session.profile._json;
			console.log(json);

			var user = {};
			user.snsType = Const.SnsType.TWITTER;
			user.userId = json.id;
			user.screenName = json.screen_name;
			user.name = json.name;
			user.image = json.profile_image_url;

			userService.registProfile({user: user}, function(err, data) {
				if (err) {
					res.send(err, 500);
					return;
				}
				deferred.call(data);
			});
			return deferred;
		}).next(function(data) {
			userService.getProfileByUserId({snsType: data.snsType, userId: data.userId}, function(err, data) {
				req.session.user = data;
				res.redirect(config.app.host);
				return;
			});
		});
	}],
	'/auth/fb/' : [passport.authenticate('facebook'), function(req, res){}],
	'/auth/fb/callback/' : [passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res){
		next(function() {
			var deferred = new Deferred();
			var json = passport.session.profile._json;
			console.log(json);

			var user = {};
			user.snsType = Const.SnsType.FACEBOOK;
			user.userId = json.id;
			user.screenName = json.username;
			user.name = json.name;
			user.image = 'https://graph.facebook.com/'+json.username+'/picture';

			userService.registProfile({user: user}, function(err, data) {
				if (err) {
					res.send(err, 500);
					return;
				}
				deferred.call(data);
			});
			return deferred;
		}).next(function(data) {
			userService.getProfileByUserId({snsType: data.snsType, userId: data.userId}, function(err, data) {
				req.session.user = data;
				res.redirect(config.app.host);
				return;
			});
		});
	}]
};

exports.posts = {};

exports.puts = {};

exports.deletes = {};

