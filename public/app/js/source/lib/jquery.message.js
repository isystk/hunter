;(function($) {
/*
 * メッセージ
 *
 * 	$.message({
 *		text: "こんにちわ"
 *  });

 */
$.message = function(opts) {

	var options = $.extend({
			text: "",
			id: "#message"
		}, opts),
	timeout = null;

	clearTimeout(options.timeout);

	var elem = $(options.id);
	var top  = 50,
		left = Math.floor($(window).scrollLeft() + ($(window).width() - elem.width() - 20));

	elem.stop().hide().css({
		position: "absolute",
		top: top + "px",
		left: Math.floor($(window).scrollLeft() + ($(window).width() + elem.width())) + "px",
		"z-index": 5000
	});

	$(options.id).html(options.text);

	elem.show().animate({
		top: top + "px",
		left: left + "px"
	}, 300, "easeOutBack", function(){

		options.timeout = setTimeout(function() {
			elem.animate({
				top: top + "px",
				left: Math.floor($(window).scrollLeft() + ($(window).width() + elem.width())) + "px"
			}, 300, "easeOutBack", function(){
				$(this).hide();
			});
		}, 2000);
	});
};

})(jQuery);

