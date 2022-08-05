/** 
 *	@license PikaJS Animate plugin 1.1.0
 *	© 2022 Scott Ogrin
 * 	MIT License
 */

 (function($,Doc,Styl,ReqAF,sT, pI, Mp) {

 	// Some Motion funcs borrowed from: https://github.com/gdsmith/jquery.easing/
 	$.animate = {
 		Version: '1.1.0',
 		motion: {
 			// These funcs modify the progress, x, as it moves from 0.00 to 1.00 over the duration in ms
 			// If duration is too short, you won't really see the effects of most of these!
			default: 'smooth',
			linear: function(x) {
				return x;
			},
			smooth: function(x) {
				return 0.5 - Math.cos(x * Math.PI) / 2;
			},
			fastslow: function(x) {
				return x === 1 ? 1 : 1 - Mp(2, -10 * x);
			},
			slowfast: function(x) {
				return x === 0 ? 0 : Mp(2, 10 * x - 10);
			},
			accelerate: function(x) {
				return 1 - Math.sqrt(1 - Mp(x, 2));
			},
			decelerate: function(x) {
				return Math.sqrt(1 - Mp(x - 1, 2));
			},
			overshoot: function(x) {
				return 1 + 2.70158 * Mp(x - 1, 3) + 1.70158 * Mp(x - 1, 2);
			},
			bounce: function(x) {
				var a = 7.5625, b = 2.75;
				if (x < 1/b) {
					return a*x*x;
				} else if (x < 2/b) {
					return a*(x-=(1.5/b))*x + 0.75;
				} else if (x < 2.5/b) {
					return a*(x-=(2.25/b))*x + 0.9375;
				} else {
					return a*(x-=(2.625/b))*x + 0.984375;
				}
			}
 		}
 	};

	$.extend($.fn, {

		// Generic .animate() that:
		// 		- can change (increase or decrease) multiple CSS params at the same time
		//		- looks up default computedStyles for you (i.e. default opacity is 1, but el[0].style.opacity = "")
		//		- can also change non-CSS element params like: scrollTop
		//		- works with numeric values only (incl: %, px, em, rem, vh, vw, vmin, vmax, pt, pc, in, cm, mm)
		//		- has one duration in ms for all CSS params
		//	  - can be delayed before executing
		//		- can automatically remove the elem after animation is complete
		// 		- comes with 8 different motion functions, or add your own!
		// 		- can run 'before' callback just before start of animation
		//		- can run 'done' callback after animation is complete
		// 		- compensates for high-refresh rate monitors
		//		- falls back to setTimeout if requestAnimationFrame is not available
		animate: function(css, opts) {
		  var el = $(this)[0], start, steps = {}, mofn;
			opts = opts || {};
			opts.duration = opts.duration || 400;
			opts.remove = opts.remove || false;
			opts.delay = opts.delay || 0;
			opts.motion = opts.motion || $.animate.motion.default;
  		if ($.t(opts.motion, 's') && !$.t($.animate.motion[opts.motion])) {
  			mofn = $.animate.motion[opts.motion];
  		} else if ($.t(opts.motion, 'f')) {
  			mofn = opts.motion;
  		}
		  // Calc increase/decrease for each css key based on start val, end val
	    for (var key in css) {
	      var val = String(css[key]), units = '', begin, end, defaults;
	      [val, end, units] = val.match(/^(.+)(px|em|%|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/, '$1$2') || [String(val), String(val), ''];
	      begin = el[Styl][key];
	      if ($.t(begin) || begin == '') {
	      	// Some CSS values are missing by default, but they're still there:
	      	defaults = getComputedStyle($(el)[0]);
	      	if (!$.t(defaults[key])) {
	      		begin = defaults[key];
	      	}
	      	if ($.t(begin) || begin == '') {
	      		// If we're still not defined, check for el params like scrollTop
	      		if (!$.t(el[key])) {
	      			begin = el[key];
	      		}
	      	}
	      }
	      begin = parseFloat(begin);
	      end = parseFloat(end);
	      // We need starting point, distance to go, inc (dec = false), and units
	      steps[key] = {
	      	begin: begin,
	      	dist: Math.abs(end - begin),
	      	inc: (end > begin) ? true : false,
	      	unit: units
	      }
	    }
		  var go = function(time, el, dur) {
		  	var time = time || +new Date;
		  	var runtime = time - start;
		  	var progress = Math.min(runtime / dur, 1); // % complete, <= 1.00
		  	var res;
		  	// Apply motion function (either built-in, or custom)
		  	progress = mofn.call(this, progress);
		  	// Do a step for each CSS parameter
		    for (var key in css) {
		      if (steps[key].inc === true) {
		      	// INC: we're increasing the key value, so we move to: begin + % done * distance
		      	res = (steps[key].begin + (steps[key].dist * progress)).toFixed(2) + steps[key].unit;
		      	if (!$.t(el[Styl][key])) {
		      		el[Styl][key] = res;
		      	} else {
		      		el[key] = res;
		      	}
		      } else {
		      	// DEC: we're DEcreasing the key value, so we move to: begin - % done * distance
		      	res = (steps[key].begin - (steps[key].dist * progress)).toFixed(2) + steps[key].unit;
		      	if (!$.t(el[Styl][key])) {
		      		el[Styl][key] = res;
		      	} else {
		      		el[key] = res;
		      	}
		      }
				}
			  if (runtime < dur) {
			  	(ReqAF && ReqAF(function(time) {
			  		go(time, el, dur);
			  	})) || sT(go(time, el, dur), 16);
			  } else {
			  	// We're done!
			  	if (opts.remove === true) {
			  		$(el).remove();
			  	}
			  	if (!$.t(opts.done)) {
			  		opts.done.call($(el));
			  	}
			  }
		  };
		  var func = function() {
		  	if (!$.t(opts.before)) {
		  		opts.before.call($(el));
		  	}
		  	(ReqAF && ReqAF(function(time) {
		  		start = time || +new Date;
		  		go(time, el, opts.duration);
		  	})) || sT(go(time, el, opts.duration), 16); // setTimeout Fallback at default 60fps = 16ms
		  };
			(opts.delay > 0) ? sT(func, opts.delay) : func();
		},

		// Fade Fun

		fade: function(delay, remove, duration, dir) {
			dir = dir || 'out';
			var op = (dir == 'out') ? 0 : 1;
			if (dir == 'in') {
				this[0][Styl].opacity = 0;
			}
			this.animate({opacity: op}, {
				delay: delay || 0,
				remove: remove || false,
				duration: duration || 214,
				before: function() {
					if (dir == 'in') {
						this[0][Styl].opacity = 0;
						if (this[0][Styl].display == 'none') {
      				this[0][Styl].display = 'block';
      			}
					}
				},
				done: function() {
					if (this.length > 0) {
						if (dir == 'out') {
							this[0][Styl].display = 'none';	
						}
						this[0][Styl].opacity = '';
					}
				}
			});
		},

		// Slide stuff

		slide: function(opts) {
		  var el = $(this)[0];
		  opts.delay = opts.delay || 0;
		  opts.remove = opts.remove || false;
		  opts.duration = opts.duration || 400;
		  opts.dir = opts.dir || 'up';
		  opts.motion = opts.motion || $.animate.motion.default;
		  if (el[Styl].display == 'none') { return; }
		  child = $(el).down();
		  var elPos = this.css('position'),
		  	childPos = child.css('position'),
		  	childHt = child.height(),
		  	childWd = child.width(),
		  	elOverflow = this.css('overflow'),
		  	elTop = pI(el[Styl].top || this.position().top),
		  	elLeft = pI(el[Styl].left || this.position().left),
		  	styles = {},
		  	acss = {},
		  	dir = {};
		  // Process opts
		  if ($.t(opts.dir, 's')) {
		  	var dirstr = opts.dir;
		  	if (dirstr.match(/up/) != null) { dir.up = childHt; } else if (dirstr.match(/down/) != null) { dir.down = childHt; }
		  	if (dirstr.match(/left/) != null) { dir.left = childWd; } else if (dirstr.match(/right/) != null) { dir.right = childWd; }
		  } else if ($.t(opts.dir, 'o')) {
		  	dir = opts.dir;
		  	if (!$.t(dir.up)) { dir.up = pI(dir.up); delete dir.down; }
		  	if (!$.t(dir.down)) { dir.down = pI(dir.down); delete dir.up; }
		  	if (!$.t(dir.left)) { dir.left = pI(dir.left); delete dir.right; }
		  	if (!$.t(dir.right)) { dir.right = pI(dir.right); delete dir.left; }
		  }
		  // {position: absolute} is okay, but static is not; el overflow must be hidden
		  if (elPos === 'static' || !elPos) { styles.position = 'relative'; }
		  if (elOverflow !== 'hidden') { styles.overflow = 'hidden'; }
		  styles.top = elTop + 'px';
		  styles.left = elLeft + 'px';
			this.css(styles);
		  if (childPos === 'static' || !childPos) {
		  	child[0][Styl].position = 'relative';
		  }
		  // Do: up, down, left, right, upleft, upright, downleft, downright
		  if (dir.up) { acss.top = (elTop - dir.up) + 'px'; }
		  if (dir.down) { acss.top = (elTop + dir.down) + 'px'; }
		  if (dir.left) { acss.left = (elLeft - dir.left) + 'px'; }
		  if (dir.right) { acss.left = (elLeft + dir.right) + 'px'; }
		  // Go
		  this.animate(acss,
		  	{
		  		delay: opts.delay,
		  		remove: opts.remove,
		  		duration: opts.duration,
		  		motion: opts.motion,
		  		before: opts.before,
		  		done: function() {
						if (this.css('top') == '0px') { this.css({top: ''}); }
						if (this.css('left') == '0px') { this.css({left: ''}); }
						this.css({
							overflow: elOverflow,
							position: elPos == 'static' ? '' : elPos
						});
						child[0][Styl].position = childPos == 'static' ? '' : childPos;
		  		}
		  	});
		},

		// Misc

		scrollTo: function(opts) {
			var el = $(this)[0], de=Doc.documentElement, db=Doc.body, Win = window, sTo=Win.scrollTo, mR = Math.round;
			opts = opts || {};
			opts.duration = opts.duration || 400;
			opts.offset = opts.offset || 0;
			var skrol = {
				left: mR(Win.pageXOffset || de.scrollLeft || db.scrollLeft),
				top: mR(Win.pageYOffset || de.scrollTop || db.scrollTop)
			};
		  var elSkrol = $.cOff(el).y + pI(opts.offset),
		  	maxSkrol = $('body').height() - de.clientHeight + 40, // 40 for a bit extra
				begin = skrol.top,
				diff = elSkrol - skrol.top, up;
			// Ignore tiny differences:
			if (Math.abs(diff) < 15) { return; }
			// Carry on
			if (diff < 0) {
				up = true;
			} else if (diff > 0) {
				up = false;
			} else {
				return;
			}
			// This doesn't use .animate() since we need to do window.scrollTo
		  var go = function(time, el, dur) {
		  	var time = time || +new Date;
		  	var runtime = time - start;
		  	var progress = Math.min(runtime / dur, 1); // % complete, <= 1.00
		 		skrol.top = begin + (diff * progress);
				// Up scroll checks
				if (up && skrol.top < 0) {
					sTo(skrol.left, 0);
					return;
				}
				if (up && skrol.top < elSkrol) { skrol.top = elSkrol; }
				// Down scroll checks
				if (!up && skrol.top > maxSkrol) {
					// Some elems are lower than max scroll-down, so stop:
					sTo(skrol.left, maxSkrol);
					return;	
				}
				if (!up && skrol.top > elSkrol) { skrol.top = elSkrol; }
				// Carry on
	    	sTo(skrol.left, skrol.top);
	    	if (runtime < dur) {
		      (ReqAF && ReqAF(function(time) {
			  		go(time, el, dur);
			  	})) || sT(go(time, el, dur), 16);
		    } else {
			  	// We're done!
			  	if (!$.t(opts.done)) {
			  		opts.done.call($(el));
			  	}
			  }
		  };
	  	(ReqAF && ReqAF(function(time) {
	  		start = time || +new Date;
	  		go(time, el, opts.duration);
	  	})) || sT(go(time, el, opts.duration), 16); // setTimeout Fallback at default 60fps = 16ms
		},

		// Scrolls passed-in element so that el (target element) is at opts.position of scrollable 'this'
		scroll: function(el, opts) {
			var css = {};
			opts = opts || {};
			opts.direction = opts.direction || 'vertical';
			opts.duration = opts.duration || 214;
			opts.delay = opts.delay || 0;
			opts.motion = opts.motion || $.animate.motion.default;
			opts.position = opts.position || {};
			opts.position.top = opts.position.top || 0;
			opts.position.left = opts.position.left || 0;
			if (opts.direction == 'vertical' || opts.direction == 'both') {
				css.scrollTop = pI(this[0].scrollTop + el.position().top - opts.position.top);
			}
			if (opts.direction == 'horizontal' || opts.direction == 'both') {
				css.scrollLeft = pI(this[0].scrollLeft + el.position().left - opts.position.left);
			}
			this.animate(css, {
				duration: opts.duration,
				delay: opts.delay,
				motion: opts.motion,
				before: opts.before,
				done: opts.done
			});
		}

	});

	// Generate (simple) fade + slide convenience functions

	$.each({
		fadeIn: 'in',
		fadeOut: 'out'
	}, function(name, props) {
		$.fn[name] = function(dly, rem, dur) {
			this.fade(dly, rem, dur, props);
		}
	});

	$.each({
		slideUp: 'up',
		slideDown: 'down',
		slideLeft: 'left',
		slideRight: 'right',
		slideUpLeft: 'upleft',
		slideDownLeft: 'downleft',
		slideUpRight: 'upright',
		slideDownRight: 'downright'
	}, function(name, props) {
		$.fn[name] = function(dly, rem, dur) {
			this.slide({dir: props, delay: dly, remove: rem, duration: dur});
		}
	});

})(Pika, document, 'style', window.requestAnimationFrame, setTimeout, parseInt, Math.pow);
