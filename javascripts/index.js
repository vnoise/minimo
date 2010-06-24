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

    var menu = $("<div class='menu'/>").appendTo(document.body);
    var console = $("<div class='console'/>").appendTo(document.body);

    $("<a href='#'>console</a>").appendTo(menu).click(function() {
        console.slideToggle();
        return false;
    });

    $("<a href='#'>save</a>").appendTo(menu).click(function() {
        controller.send('save');
        return false;
    });

    for (var i = 0; i < saves.length; i++) {
        $("<a href='#'>" + saves[i] + "</a>").appendTo(menu).click(function() {
            controller.load($(this).html());
        });        
    }

    var lastX;
    var lastY;
    var timeout;

    function touchDown(event) {
        if (event.target.localName == 'html') {
            lastX = event.pageX;
            lastY = event.pageY;
        }
    }

    function touchMove(event) {
        if (event.target.localName == 'html') {
            // log("" + event.clientX + " : " + event.clientY);

            var x = lastX - event.pageX;
            var y = lastY - event.pageY;

            scrollBy(x, y);

            lastX = event.pageX;
            lastY = event.pageY;
        }
    }

    function scrollBy(x, y) {
        if (timeout) {
            clearTimeout(timeout);
        }

        window.scrollBy(Math.ceil(x), Math.ceil(y));

        if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
            var timeout = setTimeout(scrollBy.bind(this, x * 0.7, y * 0.7), 50);
        }
    }

    function touchUp(event) {
        if (event.target.localName == 'html') {
        }
    }

    document.addEventListener("MozTouchUp", touchUp, false);
    document.addEventListener("MozTouchDown", touchDown, false);
    document.addEventListener("MozTouchMove", touchMove, false);

    document.onselectstart = function () { return false; };
    document.onselect = function () { return false; };

    document.ongesturechange = function(e) { e.preventDefault(); };
    document.ongesturestart = function(e) { e.preventDefault(); };

    controller.initialize();
});