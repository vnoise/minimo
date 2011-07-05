var TypeMenu = new Class({
    Extends: Menu,

    initialize: function (options) {
        options.options = [
            "sinus",
            "tri",
            "saw",
            "pulse",
            "noise"
        ];

        Menu.prototype.initialize.call(this, options);
    },

    onSelect: function(type) {
        this.instrument.send('/type', 'is', this.index, type);
    }    
});

var PitchMenu = new Class({
    Extends: Menu,

    initialize: function (options) {
        options.options = [0, 7, 12, 19, 24];

        Menu.prototype.initialize.call(this, options);
    },

    onSelect: function(pitch) {
        this.instrument.send('/pitch', 'ii', this.index, pitch);
    }    
});