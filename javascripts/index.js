Function.prototype.bind = function(object) {
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
};

function log(s) {
    if (typeof(s) == 'object') {
        var object = s;
        s = '{ ';
        for (var i in object) {
            s += i + ': ' + object[i] + ', ';
        }
        s += "}";
    }
    $('.console').prepend(s + "<br/>");
}


$(function() {
    document.multitouchData = true;

    // document.onselectstart = function () { return false; };
    // document.onselect = function () { return false; };

    // document.ongesturechange = function(e) { e.preventDefault(); };
    // document.ongesturestart = function(e) { e.preventDefault(); };

    controller.initialize();
});