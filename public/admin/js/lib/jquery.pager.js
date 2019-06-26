(function($) {
	// paging navigation link
	$.fn.pager = function(method, d) {
		var self = this;
		var start = Math.max(1, d.page-5);
		var end   = Math.max(1, Math.min(d.maxpage, start+9));
		start = Math.min(start, Math.max(1, end - 10));

		self.addClass('pager');

		var append = function(page) {
			if (page == d.page) {
				self.tag('strong').text(i).gat();
			} else {
				self
				.tag('a')
				.text(page)
				.click(function() {
					Admin.client.send(method, {page:page});
				})
				.gat();
			}
		};

		if (start > 1) {
			append(1);
			self.tag('span').text('...').gat();
		}
		for (var i = start; i <= end; i++) append(i);
		if (end < d.maxpage) {
			self.tag('span').text('...').gat();
			append(d.maxpage);
		}

		return self;
	};
})(jQuery);
