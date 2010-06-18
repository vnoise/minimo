Function.prototype.bind = function(object) {
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
}

function p(s) {
    if (typeof(s) == 'object') {
        var object = s;
        s = '{ ';
        for (var i in object) {
            s += i + ': ' + object[i] + ', ';
        }
        s += "}";
    }
    $('#console').append(s + ", ").css("scroll-y", 100000000);
}

$(function() {
    document.multitouchData = window.location.hash == "#moztouch";

    $('#console-link').click(function() {
        $('#console').slideToggle();
        return false;
    });

    var lastX;
    var lastY;

    function touchDown(event) {
        if (event.target.localName == 'html') {
            lastX = event.pageX;
            lastY = event.pageY;
        }
    }

    function touchMove(event) {
        if (event.target.localName == 'html') {
            // p("" + event.clientX + " : " + event.clientY);
            window.scrollBy(lastX - event.pageX, lastY - event.pageY);
            lastX = event.pageX;
            lastY = event.pageY;
        }
    }
    
    document.addEventListener("MozTouchDown", touchDown, false);
    document.addEventListener("MozTouchMove", touchMove, false);

    document.onselectstart = function () { return false; };
    document.onselect = function () { return false; };

    document.ongesturechange = function(e) { e.preventDefault(); };
    document.ongesturestart = function(e) { e.preventDefault(); };

    controller.receive();
});