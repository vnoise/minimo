Function.prototype.bind = function(object) {
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
};

function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}


$(function() {
    document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
    document.documentElement.style.webkitTouchCallout = "none";
    document.multitouchData = true;

    document.onselectstart = function () { return false; };
    document.onselect = function () { return false; };

    // document.ongesturechange = function(e) { e.preventDefault(); };
    // document.ongesturestart = function(e) { e.preventDefault(); };

    controller.initialize();
});