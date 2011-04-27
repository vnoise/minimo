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
        "saw",
        "square",
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
        "locrian"
        // "harmonic minor",
        // "melodic minor",        
        // "major pentatonic",
        // "minor pentatonic",        
        // "wholetone",
        // "whole-half",
        // "half-whole"
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

    // this.sampleMenu = this.add({
    //     type: Menu,
    //     options: window.samples,
    //     callback: this.onSelectSample.bind(this)
    // });


    this.addSlider('volume'    , 0, 0, 1, 0.01);
    this.addSlider('octave'    , 0, 0, 6, 1);
    this.addSlider('pitch'     , 0, 0, 12, 1);
    this.addSlider('lowpass'   , 1, 0.1, 1, 0.01);
    this.addSlider('hipass'    , 0.1, 0.1, 1, 0.01);
    this.addSlider('reso'      , 1, 1, 5, 0.05);
    this.addSlider('attack'    , 0, 0, 100, 1);
    this.addSlider('decay'     , 100, 0, 500, 5);
    this.addSlider('reverb'    , 0, 0, 0.5, 0.005);
    this.addSlider('echo'      , 0, 0, 1, 0.01);
    // this.addSlider('echo_time' , 4, 0, 8, 1);
    // this.addSlider('feedback'  , 0.5, 0, 1, 0.01);
};

Instrument.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        var x = 0;
        var y = 0;
        var width = this.width();

        this.drawMenus(x, y);

        y += this.typeMenu.height() + 10;

        this.clipswitcher.extent(x, y, width, 20).draw();

        y += this.clipswitcher.height() + 10;

        this.sequencer.extent(x, y, width, 100).draw();

        y += this.sequencer.height() + 10;

        this.sliders.extent(x, y, width, 100).draw();

        y += this.sliders.height() + 10;
        
        this.drawAutomations(x, y, width, 50);
    },

    drawMenus: function(x, y) {
        var w = 60;
        var h = 20;

        this.typeMenu.extent(x, y, w, h).draw();

        x += w + 10;

        this.modeMenu.extent(x, y, w, h).draw();

        x += w + 10;

        // this.sampleMenu.extent(x, y, w, h).draw();
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
        // this.sampleMenu.setLabel(sample);
    },

    mode: function(mode) {
        this.modeMenu.setLabel(mode);
    },

    addSlider: function(key, value, min, max, step) {
        this.sliders.add({
            type: Slider,
            instrument: this,
            key: key,
            value: value,
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

    _clock: function(clock) {
        if (clock === undefined) {
            this.clockCount += 1;
        }
        else {
            this.clockCount = clock;
        }

        this.sequencer.clock(this.clockCount);

        for (var i = 0; i < this.automations.length; i++) {
            this.automations[i].clock(this.clockCount);
        }
    },

    clock: function(clock, bpm) {
        this._clock(clock);

        clearInterval(this.interval);

        this.interval = setInterval(this._clock.bind(this), 60000 / this.bpm / 4);
    },

    clip: function(clip) {
        this.sequencer.setClip(clip);
        this.clipswitcher.setClip(clip);
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

