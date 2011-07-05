var Instrument = new Class({
    Extends: Widget,

    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);

        this.bpm = 120;
        this.layout = 'vertical';

        // this.initMenus();

        this.clipswitcher = this.add({ 
            type: ClipSwitcher, 
            sizeHint: 0.5,
            marginTop: 10,
            instrument: this
        });

        this.sequencer = this.add({ 
            type: Sequencer, 
            sizeHint: 2,
            marginTop: 10,
            instrument: this 
        });

        this.initSliders();
    },

    // initMenus: function() {
    //     this.menus = this.add({ 
    //         layout: 'horizontal',
    //         sizeHint: 0.2,
    //         instrument: this 
    //     });

    //     this.typeMenu = this.menus.add({
    //         type: TypeMenu,
    //         instrument: this
    //     });

    //     this.modeMenu = this.menus.add({
    //         type: ModeMenu,
    //         instrument: this
    //     });

    //     this.dirMenu = this.menus.add({
    //         type: SampleDirMenu,
    //         instrument: this
    //     });

    //     this.sampleMenu = this.menus.add({
    //         type: SampleMenu,
    //         instrument: this
    //     });

    //     this.dirMenu.sampleMenu = this.sampleMenu;
    // },

    initSliders: function() {
        this.sliders = this.add({ 
            layout: 'horizontal',
            sizeHint: 2,
            marginTop: 10,
            instrument: this 
        });

        this.automations = [];

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

    // samples: function(samples) {
    //     this.dirMenu.samples(samples)
    // },

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

    // type: function(type) {
    //     this.typeMenu.setLabel(type);
    // },

    // sample: function(sample) {
    //     var name = sample.split('/');
    //     this.dir = name[0];
    //     this.dirMenu.setLabel(name[0]);
    //     this.sampleMenu.setLabel(name[1]);
    // },

    // mode: function(mode) {
    //     this.modeMenu.setLabel(mode);
    // },

    addSlider: function(key, min, max, step) {
        this.sliders.add({
            type: Slider,
            instrument: this,
            marginRight: 10,
            key: key,
            min: min,
            max: max,
            step: step
        });

        if (this.children.length < 8) {
            var automation = this.add({
                type: Automation,
                instrument: this,
                marginTop: 10,
                key: key, 
                min: min, 
                max: max, 
                step: step
            });

            this.automations.push(automation);
        }
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

        if (fun) {
            fun.apply(this, message.args);
        }
        else {
            // console.log('action not found: ' + action);
        }
    }
});
