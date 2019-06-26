var config = require('../server/config');
var Deferred = require('jsdeferred').Deferred;
Deferred.define();

var adminService = require('../server/service/admin');

exports.gets = {
	'/' : function(req, res){
		res.render('index', {title: config.admin.title, description: config.admin.description, mode: config.mode});
	}
};

exports.posts = {
	'/upload/?' : function(req, res){

		if (!req.files.upload) {
			res.send(500);
			return;
		}

		// ファイル名チェック
		var fileName = req.files.upload.name;
		if(!fileName.match(new RegExp("^hunter"))){
			res.send('ファイル名が[hunter]で始まっていません。',{'Content-Type':'text/plain'}, 500);
			return;
		}

		adminService.oplog({id:req.headers.cookie.match(/ai=([\D]+);/)[1], connection:{socket:req.connection}}, 'file.upload', req.body);

		var colname = req.body.colname;
		var selector = req.body.selector ? JSON.parse(req.body.selector) : {};
		var clean = req.body.clean;
		var path = req.files.upload.path;

		adminService.upload(colname, selector, clean, path, function(err) {
			if (err) {
				logger.error(err);
				res.send('{success:false}',{'Content-Type':'text/plain'},500);
			} else {
				res.send('{success:true}',{'Content-Type':'text/plain'},200);
			}
		});

	},
	'/download/?' : function(req, res){
		var colname = req.body.colname;
		var selector = (req.body.selector) ? JSON.parse(req.body.selector) : {};
		var sort = (req.body.sort) ? JSON.parse(req.body.sort) : {};
		adminService.download(colname, selector, sort, res);
	}
};

exports.puts = {};

exports.deletes = {};

