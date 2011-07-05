var TypeMenu = new Class({
    Extends: Menu,

    initialize: function (options) {
        options.options = [
            "sample",
            "sinus",
            "sinus_noise",
            "sinus_fifth",
            "sinus_oct",
            "tri",
            "tri_noise",
            "tri_fifth",
            "tri_oct",
            "saw",
            "saw_noise",
            "saw_fifth",
            "saw_oct",
            "pulse",
            "pulse_saw",
            "pulse_tri",
            "pulse_fifth",
            "pulse_oct",
            "noise"
        ];

        Menu.prototype.initialize.call(this, options);
    },

    onSelect: function(type) {
        this.instrument.send('/type', 's', type);
    }    
});