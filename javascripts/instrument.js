function Instrument(options) {
    Widget.call(this, options);

    this.clipswitcher   = this.add({ type: ClipSwitcher, instrument: this });
    this.sequencer      = this.add({ type: Sequencer, instrument: this });
    this.sliders        = this.add({ type: SliderPanel, instrument: this });
    this.automations    = [];
    this.sendPort       = 10000 + this.index;
    this.recvPort       = 20000 + this.index;
    this.bpm            = 120;

    this.types = [
        "sinus",
        "sinus_fifth",
        "sinus_oct",
        "saw",
        "saw_fifth",
        "saw_oct",
        "pulse",
        "pulse_fifth",
        "pulse_oct",
        "noise",
        "sample"
    ];

    this.modes = [
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

    this.typeMenu = this.add({
        type: Menu,
        options: this.types,
        callback: this.onSelectType.bind(this)
    });

    this.modeMenu = this.add({
        type: Menu,
        options: this.modes,
        callback: this.onSelectMode.bind(this)
    });

    this.sampleMenu = this.add({
        type: Menu,
        callback: this.onSelectSample.bind(this)
    });

    setTimeout(function() {
        $.get('/samples/' + this.index, function(samples) {
            this.sampleMenu.options = samples;
        }.bind(this));
    }.bind(this), this.index * 500);

    this.addSlider('volume'    , 0, 1, 0.01);
    this.addSlider('octave'    , 0, 6, 1);
    this.addSlider('pitch'     , 0, 12, 1);
    this.addSlider('pwidth'    , 0, 1, 0.01);
    this.addSlider('cutoff'    , 0.1, 1, 0.01);
    this.addSlider('reso'      , 1, 5, 0.01);
    this.addSlider('attack'    , 0, 1000, 10);
    this.addSlider('decay'     , 0, 1000, 10);
    this.addSlider('reverb'    , 0, 0.5, 0.005);
    this.addSlider('delay'     , 0, 1, 0.01);
    this.addSlider('dtime'     , 0, 8, 1);
    this.addSlider('fback'     , 0, 1, 0.01);
};

Instrument.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        var y = 0;
        var width = this.width();

        this.drawMenus(0, y);

        y += this.typeMenu.height() + 10;

        this.clipswitcher.extent(0, y, width, 20).draw();

        y += this.clipswitcher.height() + 10;

        this.sequencer.extent(0, y, width, 100).draw();

        y += this.sequencer.height() + 10;

        this.sliders.extent(0, y, width, 100).draw();

        y += this.sliders.height() + 10;
        
        this.drawAutomations(0, y, width, 50);
    },

    drawMenus: function(x, y) {
        var w = 100;
        var h = 20;

        this.typeMenu.extent(x, y, w, h).draw();

        x += w + 10;

        this.modeMenu.extent(x, y, w, h).draw();

        x += w + 10;

        this.sampleMenu.extent(x, y, w, h).draw();
    },

    drawAutomations: function(x, y, w, h) {
        for (var i = 0; i < this.automations.length; i++, y += h) {
            this.automations[i].extent(x, y, w, h).draw();
        }        
    },

    getSlider: function(key) {
        return this.sliders.child(key);
    },

    getAutomation: function(key) {
        for (var i = 0; i < this.automations.length; i++) {
            if (this.automations[i].key == key) {
                return this.automations[i];
            }    
        }
        return null;
    },

    onSelectType: function(type) {
        this.send('/type', 's', type);
    },

    onSelectSample: function(sample) {
        this.send('/sample', 's', sample);
    },

    onSelectMode: function(mode) {
        this.send('/mode', 's', mode);
    },

    type: function(type) {
        this.typeMenu.setLabel(type);
    },

    sample: function(sample) {
        this.sampleMenu.setLabel(sample);
    },

    mode: function(mode) {
        this.modeMenu.setLabel(mode);
    },

    addSlider: function(key, min, max, step) {
        this.sliders.add({
            type: Slider,
            instrument: this,
            key: key,
            min: min,
            max: max,
            step: step
        });

        var automation = this.add({
            type: Automation,
            instrument: this,
            key: key, 
            min: min, 
            max: max, 
            step: step
        });

        this.automations.push(automation);
    },

    slider: function(key, min, max, step) {
        this.sliders.add({
            type: Slider,
            key: key, 
            min: min, 
            max: max, 
            step: step
        });

        var automation = new Automation({
            parent: this,
            instrument: this,
            key: key, 
            min: min, 
            max: max, 
            step: step
        });

        this.automations.push(automation);
    },
    
    pattern: function(clip, index, value) {
        this.sequencer.setStep(clip, index, value);
    },

    parameter: function(key, value) {
        var slider = this.getSlider(key);

        if (slider) slider.setValue(value);
    },

    automation: function(key, index, value) {
        var automation = this.getAutomation(key);
        
        if (automation) automation.setStep(index, value);
    },

    clock: function(clock, bpm) {
        this.bpm = bpm;

        this.sequencer.clock(clock);

        for (var i = 0; i < this.automations.length; i++) {
            this.automations[i].clock(clock);
        }
    },

    clip: function(clip) {
        this.sequencer.clip(clip);
        this.clipswitcher.clip(clip);
    },

    send: function(address, types) {
        this.controller.send({
            instrument: this.index,
            address: address,
            types: types,
            args: Array.prototype.slice.call(arguments, 2)
        });
    },

    receive: function(message) {
        var action = message.address.slice(1);
        var fun = this[action];

        if (fun) {
            fun.apply(this, message.args);
        }
        else {
            console.log('action not found: ' + action);
        }
    }
};
