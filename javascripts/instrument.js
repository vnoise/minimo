var Instrument = new Class({
    Extends: Widget,

    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);

        this.bpm = 120;
        this.layout = 'vertical';

        this.initMenus();

        this.clipswitcher = this.add({ 
            type: ClipSwitcher, 
            sizeHint: 0.5,
            marginTop: 5,
            instrument: this
        });

        this.sequencer = this.add({ 
            type: Sequencer, 
            sizeHint: 1,
            marginTop: 5,
            instrument: this 
        });

        this.initButtons();
        this.initSliders();
    },

    initButtons: function() {
        this.buttons = this.add({ 
            layout: 'horizontal',
            sizeHint: 0.5,
            instrument: this 
        });

        this.buttons.add({
            type: ToggleButton,
            label: "Osc",
            on: {
                click: this.toggleGroup.bind(this, ["volume", "pitch", "octave", "detune", "pwidth"])
            }
        });

        this.buttons.add({
            type: ToggleButton,
            label: "Filter",
            on: {
                click: this.toggleGroup.bind(this, ["cutoff", "reso"])
            }
        });

        this.buttons.add({
            type: ToggleButton,
            label: "ADSR",
            on: {
                click: this.toggleGroup.bind(this, ["attack", "decay", "sustain", "release"])
            }
        });

        this.buttons.add({
            type: ToggleButton,
            label: "FX",
            on: {
                click: this.toggleGroup.bind(this, ["reverb", "delay", "dtime", "feedback"])                    
            }
        });

    },

    toggleGroup: function(keys) {
        keys.each(function(key) {
            var automation = this.getAutomation(key);
            automation.visible = !automation.visible;
        }.bind(this));
    },

    initMenus: function() {
        this.menus = this.add({ 
            layout: 'horizontal',
            sizeHint: 0.5,
            instrument: this 
        });

        this.type1Menu = this.menus.add({
            type: TypeMenu,
            instrument: this,
            index: 1
        });

        this.pitch1Menu = this.menus.add({
            type: PitchMenu,
            instrument: this,
            index: 1
        });

        this.type2Menu = this.menus.add({
            type: TypeMenu,
            instrument: this,
            index: 2
        });

        this.pitch2Menu = this.menus.add({
            type: PitchMenu,
            instrument: this,
            index: 2
        });

        this.modeMenu = this.menus.add({
            type: ModeMenu,
            instrument: this
        });
    },

    initSliders: function() {
        this.sliders = this.add({ 
            layout: 'horizontal',
            sizeHint: 2,
            marginTop: 5,
            instrument: this 
        });

        this.automations = this.add({ 
            layout: 'vertical',
            sizeHint: 10,
            marginTop: 5,
            instrument: this 
        });

        this.addSlider(this.color1, 'volume'    , 0, 1, 0.01);
        this.addSlider(this.color1, 'octave'    , 0, 6, 1);
        this.addSlider(this.color1, 'pitch'     , 0, 12, 1);
        this.addSlider(this.color1, 'detune'    , 0, 0.05, 0.0005);
        this.addSlider(this.color1, 'pwidth'    , 0, 1, 0.01);
        this.addSlider(this.color1, 'cutoff'    , 0.1, 1, 0.01);
        this.addSlider(this.color1, 'reso'      , 1, 5, 0.01);
        this.addSlider(this.color2, 'attack'    , 0, 1000, 10);
        this.addSlider(this.color2, 'decay'     , 0, 1000, 10);
        this.addSlider(this.color2, 'sustain'   , 0, 1, 0.01);
        this.addSlider(this.color2, 'release'   , 0, 1000, 10);
        this.addSlider(this.color3, 'reverb'    , 0, 0.5, 0.005);
        this.addSlider(this.color3, 'delay'     , 0, 1, 0.01);
        this.addSlider(this.color3, 'dtime'     , 0, 8, 1);
        this.addSlider(this.color3, 'fback'     , 0, 1, 0.01);
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

    getSlider: function(key) {
        return this.sliders.child(key);
    },

    getAutomation: function(key) {
        for (var i = 0; i < this.automations.children.length; i++) {
            if (this.automations.children[i].key == key) {
                return this.automations.children[i];
            }    
        }
        return null;
    },

    type: function(index, type) {
        if (index == 1) {
            this.type1Menu.value(type);
        }
        if (index == 2) {
            this.type2Menu.value(type);
        }
    },

    pitch: function(index, type) {
        if (index == 1) {
            this.pitch1Menu.value(type);
        }
        if (index == 2) {
            this.pitch2Menu.value(type);
        }
    },

    mode: function(mode) {
        this.modeMenu.value(mode);
    },

    addSlider: function(color, key, min, max, step) {
        this.sliders.add({
            type: Slider,
            fgColor: color,
            instrument: this,
            label: key,
            key: key,
            min: min,
            max: max,
            step: step
        });

        var automation = this.automations.add({
            type: Automation,
            visible: false,
            fgColor: color,
            instrument: this,
            marginTop: 5,
            key: key, 
            min: min, 
            max: max, 
            step: step
        });
    },
    
    pattern: function(clip, index, value) {
        this.sequencer.setStep(clip, index, value);
    },

    parameter: function(key, value) {
        var slider = this.getSlider(key);

        if (slider) slider.value(value);
    },

    automation: function(key, index, value) {
        var automation = this.getAutomation(key);
        
        if (automation) {
            automation.setStep(index, value);
        }
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
        //console.log('action =========' + action);

        if (fun) {
            fun.apply(this, message.args);
        }
        else {
            console.log('action not found: ' + action);
        }
    }
});
