var ModeMenu = new Class({
    Extends: Menu,

    initialize: function (options) {
        options.options = [
            // "lydian",
            // "ionian",
            "phrygian",
            "mixolydian",
            "dorian",
            "aeolian",
            // "locrian",
            // "harmonic minor",
            // "melodic minor",        
            "major pentatonic",
            "minor pentatonic",
            "chromatic",
            // "wholetone",
            // "whole-half",
            // "half-whole"
        ];

        Menu.prototype.initialize.call(this, options);
    },

    onSelect: function(mode) {
        this.instrument.send('/mode', 's', mode);
    }

});