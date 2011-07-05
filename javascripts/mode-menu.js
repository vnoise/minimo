var ModeMenu = new Class({
    Extends: Menu,

    initialize: function (options) {
        options.options = [
            "chromatic",
            "lydian",
            "ionian",
            "mixolydian",
            "dorian",
            "aeolian",
            "phrygian",
            "locrian",
            "harmonic minor",
            "melodic minor",        
            "major pentatonic",
            "minor pentatonic",
            "wholetone",
            "whole-half",
            "half-whole"
        ];

        Menu.prototype.initialize.call(this, options);
    },

    onSelect: function(mode) {
        this.instrument.send('/mode', 's', mode);
    }

});