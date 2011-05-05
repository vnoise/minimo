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
    controller.initialize();
});