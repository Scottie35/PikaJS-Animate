# PikaJS-Animate

Animation plugin for PikaJS that is only **4.7kB** minified!!

## What is PikaJS?

[PikaJS](https://github.com/Scottie35/PikaJS) is a client-side scripting library like jQuery, but 7 times smaller, faster, and more efficient.

**You must include PikaJS before adding PikaJS Animate to your page!**

## What does it do?

Pika's Animate plugin provides 4 main simple yet powerful functions that enable you to do crazy-nifty animations.

The four main functions are: `.animate`, `.fade`, `.slide`, and `.scrollTo`.

There are 10 added 'convenience functions' that let you fade elements in/out and slide them on the page up, down, left, right, up-left, up-right, down-left, and down-right.

But with the .animate method, you can literally animate **any** numerical CSS or Node attribute value and do all sorts of wild and crazy things!

Let's get choochin':

### .animate

Use `.animate` like so:

    $('whatever').animate(CSS_OBJECT, OPTIONS_OBJECT);

The following will give you an idea of the accepted params (default values indicated):

    $('div.blah').animate({
      // CSS:
      top: 200px,     // For example...
      left: 100px,
      opacity: 1
    }, {
      // OPTIONS:
      duration: 400,
      delay: 0,
      remove: false,
      motion: $.animate.motion.default,    // aka 'smooth'
      before: null,                        // function run before animation
      done: null,                          // function to run after animation
    });

For the CSS, `.animate` can change (increase or decrease) one or more CSS params at the same time.

CSS values must be numerical, and can include: %, px, em, rem, vh, vw, vmin, vmax, pt, pc, in, cm, mm

Each value will be increased or decreased depending on the starting value of that param when `.animate` is run.

For CSS values that don't have a defined default, `.animate` uses `getComputedStyle`. For example, when opacity=1, `.animate` will get it for you. You do NOT need to define opacity=1 in your stylesheet or inline CSS just to make `.animate` happy!

`.animate` can also change **non-CSS** Node attributes such as clientHeight, offsetHeight, scrollHeight, scrollTop, etc. Simply include them in the CSS Object passed into `.animate`. When `.animate` can't find the param as CSS via `getComputedStyle`, it defaults to searching for that param as a Node attribute.

The *duration* option sets the time of the animation in ms. Default is 400 ms. **NOTE:** If this number is set too low, the motion functions will all appear the same!

The *delay* option sets the time to wait before executing the animation. Default is 0 ms.

The *remove* option calls .remove on the selected element after the animation is complete. Default is false.

The *motion* option sets the Motion Function used for the animation. Default is 'smooth'.

- linear - linear motion
- smooth - a smooth motion that looks more 'natural' than linear
- fastslow - move fast, then move slow
- slowfast - move slow, then move fast
- accelerate - increase speed the whole time
- decelerate - decrease speed the whole time
- overshoot - moves a bit beyond the endpoint, then moves back
- bounce - it's, well, bouncy

All the motion functions are defined in `$.animate.motion`. The default is `$.animate.motion.default`, which is 'smooth'. To change the default motion, just set `$.animate.motion.default` to the string name of one of the above motion functions.

You can also add your own motion functions by `$.extend`-ing `$.animate.motion`. All motion functions take an input, x. This input varies between 0.00 and 1.00 over the *duration* in ms of the animation. So, the motion functions simply mathematically modify the x input and return a different value. See the source code for more info.

The *before* function, if defined, is called prior to the animation. The function's *this* = the Pika object `.animate` was called on.

The *done* function, if defined, is called after the animation is done. The function's *this* = the Pika object `.animate` was called on.

Note that `.animate` uses `requestAnimationFrame` if possible, and is more robust. In Pika 1.2, animations did not compensate for high-refresh rate screens. Pika Animate does. If `requestAnimationFrame` is not available, setTimeout will be used instead (with a default of 60fps).

### .fade

`.fade` does exactly what it sounds like. Use it like so:

    $('whatever').fade(delay, remove, duration, dir);
  
Options are as follows:

- delay - delay in ms before fading. Default is 0.
- remove - removes element after fade. Default is false.
- duration - the time in ms to execute the fade. Default is 214 ms.
- dir - Either 'out' or 'in'. Default is 'out' (i.e. fade out)

`.fade` uses `.animate` internally, including its own custom *before* and *done* functions.

### .slide

`.slide` moves an element on the page in any of 8 directions. If the element is visible on the page, it moves it until it's off the page. If the element is already off the page, it moves it either MORE off the page, or back onto the screen.

IOW, you'd want to do `.slideUp` to make a DIV disappear off the screen, and then `.slideDown` to bring it back into view on the page.

Use it like so:

    $('whatever').slide(OPTS_OBJECT);
  
Options that can be defined in the OPS_OBJECT are as follows:

- delay - delay in ms before fading. Default is 0.
- remove - removes element after fade. Default is false.
- duration - the time in ms to execute the fade. Default is 400 ms.
- dir - One of: 'up', 'down', 'left', 'right', 'upleft', 'downleft', 'upright', 'downright'. Order of words in diagonal dirs doesn't matter. Default is 'up' (i.e. slide up)
- motion - One of the 8 predefined motion functions (see `.animate` for more info)

`.slide` uses `.animate` internally, including its own custom *done* function.

### .scrollTo

`.scrollTo` scrolls the page to the passed-in Pika object's position on the page. Use it like so:

    $('div.blah').scrollTo(OPTS_OBJECT);
  
Options that can be defined in the OPS_OBJECT are as follows:

- duration - the time in ms to execute the fade. Default is 400 ms.
- offset - A positive or negative integer to add to the final scroll position. Default is 0.

`.scrollTo` does NOT use `.animate` internally since it needs to animate window.scrollTo.

### Convenience Functions

PikaJS Animate includes 10 easy-to-use functions to get you rolling. They do exactly what they say!

- `.fadeIn(delay, remove, duration)`
- `.fadeOut(delay, remove, duration)`

Remember when using these slide functions that if you call one to slide an element off the screen, you need to call the opposite function to bring it back.

For example: `.slideUpLeft` to make it disappear, and then `.slideDownRight` to make it re-appear.

- `.slideUp(delay, remove, duration)`
- `.slideDown(delay, remove, duration)`
- `.slideLeft(delay, remove, duration)`
- `.slideRight(delay, remove, duration)`
- `.slideUpLeft(delay, remove, duration)`
- `.slideDownLeft(delay, remove, duration)`
- `.slideUpRight(delay, remove, duration)`
- `.slideDownRight(delay, remove, duration)`

**That's all, folks!**
