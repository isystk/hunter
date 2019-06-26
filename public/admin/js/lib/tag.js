// patch: custom attributes.
/**
 * Tag Plugin for jQuery 1.1.2
 *
 * Original Copyright(C) 2007 LEARNING RESOURCE LAB.
 * http://postal-search-apis-and-solutions.blogspot.com/
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Modified by Suguru Namura
 */
(function($) {
    jQuery.fn.extend({
        tag : function(name, options) {
            return this.pushStack(function() {
                var part = '<'+name;
                for (var key in options) {
                    part += ' '+key+'="'+options[key]+'"';
                }
                part+=' >';
                return jQuery(part);
            }());
        },
        tagset: function(name, options) {
            var self = this;
            return this.pushStack(function() {
                self.empty();
                var part = '<'+name;
                for (var key in options) {
                    part += ' '+key+'="'+options[key]+'"';
                }
                part+=' >';
                return jQuery(part);
            }());
        },
        exec: function(callback) {
            var self = this;
            callback.apply(this);
            return self;
        },
        gat : function() {
            return this.end().append(this);
        }
    });
})(jQuery); // function($)
