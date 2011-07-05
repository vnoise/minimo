var SampleDirMenu = new Class({
    Extends: Menu,

    onSelect: function(dir) {
        this.sampleMenu.dir = dir;
        this.sampleMenu.options(this._samples[dir]);
    },

    samples: function(samples) {
        this._samples = {};
        samples.each(function(sample) {
            var name = sample.split('/');
            var dir = name[0];
            var file = name[1];
            
            if (this._samples[dir] === undefined) {
                this._samples[dir] = [];
            }

            this._samples[dir].push(file);
        }, this);
        
        for (var dir in this._samples) {
            this.addButton({
                type: MenuButton,
                value: dir
            });
        }
    }
});

var SampleMenu = new Class({
    Extends: Menu,

    onSelect: function(sample) {
        this.instrument.send('/sample', 's', this.dir + '/' + sample);
    }
});