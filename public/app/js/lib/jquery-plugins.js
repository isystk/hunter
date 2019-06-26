/**
 * jQuery.bottom
 * Dual licensed under MIT and GPL.
 * Date: 2010-04-25
 *
 * @description Trigger the bottom event when the user has scrolled to the bottom of an element
 * @author Jim Yi
 * @version 1.0
 *
 * @id jQuery.fn.bottom
 * @param {Object} settings Hash of settings.
 * @return {jQuery} Returns the same jQuery object for chaining.
 *
 */
(function($){
	$.fn.bottom = function(options) {

		var defaults = {
			// how close to the scrollbar is to the bottom before triggering the event
			proximity: 0
		};

		var options = $.extend(defaults, options);

		return this.each(function() {
			var obj = this;
			$(obj).bind("scroll", function() {
				if (obj == window) {
					scrollHeight = $(document).height();
				}
				else {
					scrollHeight = $(obj)[0].scrollHeight;
				}
				scrollPosition = $(obj).height() + $(obj).scrollTop();
				if ( (scrollHeight - scrollPosition) / scrollHeight <= options.proximity) {
					$(obj).trigger("bottom");
				}
			});

			return false;
		});
	};
})(jQuery);
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @example $.cookie('the_cookie', 'the_value');
 * @example $.cookie('the_cookie', null);
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @type undefined
 *
 * @name $.cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */;(function($) {
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

/*
* Notify Bar - jQuery plugin
*
* Copyright (c) 2009-2010 Dmitri Smirnov
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Version: 1.2.2
*
* Project home:
* http://www.dmitri.me/blog/notify-bar
*/
 
/**
* param Object
*/
jQuery.notifyBar = function(settings) {
  
  (function($) {
    
    var bar = notifyBarNS = {};
    notifyBarNS.shown = false;
     
    if( !settings) {
    settings = {};
    }
    // HTML inside bar
    notifyBarNS.html = settings.html || "Your message here";
     
    //How long bar will be delayed, doesn't count animation time.
    notifyBarNS.delay = settings.delay || 2000;
     
    //How long notifyBarNS bar will be slided up and down
    notifyBarNS.animationSpeed = settings.animationSpeed || 200;
     
    //Use own jquery object usually DIV, or use default
    notifyBarNS.jqObject = settings.jqObject;
     
    //Set up own class
    notifyBarNS.cls = settings.cls || "";
    
    //close button
    notifyBarNS.close = settings.close || false;
    
    if( notifyBarNS.jqObject) {
      bar = notifyBarNS.jqObject;
      notifyBarNS.html = bar.html();
    } else {
      bar = jQuery("<div></div>")
      .addClass("jquery-notify-bar")
      .addClass(notifyBarNS.cls)
      .attr("id", "__notifyBar");
    }
         
    bar.html(notifyBarNS.html).hide();
    var id = bar.attr("id");
    switch (notifyBarNS.animationSpeed) {
      case "slow":
      asTime = 600;
      break;
      case "normal":
      asTime = 400;
      break;
      case "fast":
      asTime = 200;
      break;
      default:
      asTime = notifyBarNS.animationSpeed;
    }
    if( bar != 'object') {
      jQuery("body").prepend(bar);
    }
    
    // Style close button in CSS file
    if( notifyBarNS.close) {
      bar.append(jQuery("<a href='#' class='notify-bar-close'>Close [X]</a>"));
      jQuery(".notify-bar-close").click(function() {
        if( bar.attr("id") == "__notifyBar") {
          jQuery("#" + id).slideUp(asTime, function() { jQuery("#" + id).remove() });
        } else {
          jQuery("#" + id).slideUp(asTime);
        }
        return false;
      });
    }
    
  // Check if we've got any visible bars and if we have, slide them up before showing the new one
  if($('.jquery-notify-bar:visible').length > 0) {
    $('.jquery-notify-bar:visible').stop().slideUp(asTime, function() {
      bar.stop().slideDown(asTime);
    });
  } else {
    bar.slideDown(asTime);
  }
  
  // Allow the user to click on the bar to close it
  bar.click(function() {
    $(this).slideUp(asTime);
  })
     
  // If taken from DOM dot not remove just hide
  if( bar.attr("id") == "__notifyBar") {
    setTimeout("jQuery('#" + id + "').stop().slideUp(" + asTime +", function() {jQuery('#" + id + "').remove()});", notifyBarNS.delay + asTime);
  } else {
    setTimeout("jQuery('#" + id + "').stop().slideUp(" + asTime +", function() {jQuery('#" + id + "')});", notifyBarNS.delay + asTime);
  }

})(jQuery) };

// patch: custom attributes.
/**
 * Tag Plugin for jQuery 1.1.2
 *
 * Original Copyright(C) 2007 LEARNING RESOURCE LAB.
 * http://postal-search-apis-and-solutions.blogspot.com/
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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

