class Parameter {
    float min;
    float max;
    float range;
    float value;
    float pattern[16][16];
    
    public float read(int clip, int pos) {
        return Math.max(min, Math.min(max, value + pattern[clip][pos] * range));
    }

    public void init(float _min, float _max) {
        // _min => min;
        // _max => max;
        
        for (0 => int i; i < 16; i++) {
            for (0 => int j; j < 16; j++) {
                0 => pattern[i][j];
            }
        }
    }
};


class Instrument {
    0 => int clip;
    0 => int position;

    SinOsc sinus;
    SawOsc saw;
    SqrOsc square;
    Noise noise;
    LPF lowpass;
    HPF hipass;
    ADSR adsr;
    Dyno comp;
    Dyno limiter;
    Dyno lplimit;
    Dyno hplimit;
    Dyno osclimit;
    NRev reverb;
    DelayL delay;
    Gain feedback;
    Gain echoSend;
    Gain reverbSend;
    Gain pregain;
    Gain gain;
    Gain output;    

    noise  => osclimit;
    sinus  => osclimit;
    saw    => osclimit;
    square => osclimit;

    comp.compress();
    limiter.limit();
    osclimit.limit();
    lplimit.limit();
    hplimit.limit();
    
    0::ms => limiter.attackTime;
    0::ms => osclimit.attackTime;
    0::ms => lplimit.attackTime;
    0::ms => hplimit.attackTime;
    
    0.9 => limiter. thresh;
    0.9 => osclimit.thresh;
    0.9 => lplimit. thresh;
    0.9 => hplimit. thresh;

    0 => limiter. slopeAbove; 
    0 => osclimit.slopeAbove; 
    0 => lplimit. slopeAbove; 
    0 => hplimit. slopeAbove;

    0.8 => limiter. gain; 
    0.8 => osclimit.gain; 
    0.8 => lplimit. gain; 
    0.8 => hplimit. gain;

    comp => reverbSend => reverb => limiter;
    comp => echoSend   => delay => limiter;
    
    feedback => delay => feedback;

    osclimit => hipass => hplimit => lowpass => lplimit => adsr => comp => limiter => output;

    float pattern[16][16];
    Parameter @ parameters[16];

    parameter("sinus", 0, 1, 1);
    parameter("saw", 0, 1, 1);
    parameter("square", 0, 1, 1);
    parameter("noise", 0, 1, 1);
    parameter("attack", 1, 500, 500);
    parameter("decay", 1, 500, 500);
    parameter("pitch", 0, 96, 12);
    parameter("lowpass", 0.1, 1, 1);
    parameter("hipass", 0, 1, 1);
    parameter("reso", 0, 5, 5);
    parameter("reverb", 0, 1, 1);
    parameter("echo", 0, 1, 1);
    parameter("echo_time", 0, 2000, 1000);
    parameter("feedback", 0, 1, 1);

    public void parameter(string key, float min, float max, float range) {
        new Parameter @=> Parameter @ param;
        param @=> parameters[key];
        min => param.min;
        max => param.max;
        range => param.range;
        0 => param.value;
    }

    public void init() {        
        0 => noise.gain;
        0 => sinus.gain;
        0 => saw.gain;
        0 => square.gain;

        20000 => lowpass.freq;
        0     => hipass.freq;

        1 => reverb.mix;
        0 => reverbSend.gain;
        0 => echoSend.gain;
        
        2000::ms => delay.max;
        
        adsr.set(0::ms, 100::ms, 0.0, 0::ms);
                
        for (0 => int i; i < 16; i++) {
            for (0 => int j; j < 16; j++) {
                0 => pattern[i][j];
            }
        }
    }

    public float read(string key) {
        return parameters[key].read(clip, position);
    }
    
    public void play(int pos) {
        pos => position;
        
        read("sinus")           => sinus.gain;
        read("saw")/3           => saw.gain;
        read("square")/3        => square.gain;
        read("noise")/3         => noise.gain;
        read("attack")::ms      => adsr.attackTime;
        read("decay")::ms       => adsr.decayTime;
        read("reso")            => lowpass.Q;
        read("reverb")          => reverbSend.gain;
        read("echo")            => echoSend.gain;
        read("echo_time")::ms   => delay.delay;
        read("feedback")        => feedback.gain;

        Math.min(0.5, 1 / (read("sinus") + read("saw") + read("square") + read("noise"))) => osclimit.gain;

        Std.mtof(read("pitch")) => sinus.freq;
        Std.mtof(read("pitch")) => saw.freq;
        Std.mtof(read("pitch")) => square.freq;
        
        Math.pow(read("lowpass"), 4) * 20000 => lowpass.freq;
        Math.pow(read("hipass"), 4) * 20000  => hipass.freq;

        if (pattern[clip][position] == 1) {
            adsr.keyOff();
            adsr.keyOn();
        }
    }
}

Dyno limiter;
Dyno compressor;

0           => limiter.slopeAbove;
1.0         => limiter.slopeBelow;
0.95        => limiter.thresh;
0::ms       => limiter.attackTime;
10::ms      => limiter.releaseTime;

0.5         => compressor.slopeAbove;
1.0         => compressor.slopeBelow;
0.5         => compressor.thresh;
30::ms      => compressor.attackTime;
300::ms     => compressor.releaseTime;
1           => compressor.gain;

compressor => limiter => dac;

Instrument instruments[4];

for (0 => int i; i < 4; i++) {
    new Instrument @=> instruments[i];
    instruments[i].init();
    instruments[i].output => compressor;
}

OscRecv receiver;
3334 => receiver.port;
receiver.listen();

fun void receive(string address) {
    receiver.event(address) @=> OscEvent e;
    
    while (true) {
        e => now;
        
        while (e.nextMsg() != 0) {
            e.getInt() => int index;

            instruments[index] @=> Instrument instrument;
            
            if (address == "/pattern,iiif") {
                e.getInt() => int clip;
                e.getInt() => int pos;
                e.getFloat() => float value;

                value => instrument.pattern[clip][pos];

                <<< address, index, clip, pos, value >>>;
            }

            if (address == "/instument,i") {
                instrument.init();
            }
            
            if (address == "/slider,isfff") {
                e.getString() => string key;
                e.getFloat() => float min;
                e.getFloat() => float max;
                e.getFloat() => float step;
                
                instrument.parameters[key].init(min, max);
                
                <<< address, index, key, min, max, step >>>;
            }

            if (address == "/clip,ii") {
                e.getInt() => int clip;

                clip => instrument.clip;

                <<< address, index, clip >>>;
            }
                        
            if (address == "/automation,isiif") {
                e.getString() => string key;
                e.getInt() => int clip;
                e.getInt() => int pos;
                e.getFloat() => float value;

                value => instrument.parameters[key].pattern[clip][pos];

                <<< address, index, key, clip, pos, value >>>;
            }

            if (address == "/parameter,isf") {
                e.getString() => string key;
                e.getFloat() => float value;
                
                value => instrument.parameters[key].value;
                
                <<< address, index, key, value >>>;
            }
        }
    }
}

spork ~ receive("/automation,isiif");
spork ~ receive("/pattern,iiif");
spork ~ receive("/instrument,i");
spork ~ receive("/slider,isfff");
spork ~ receive("/clip,ii");
spork ~ receive("/parameter,isf");

OscSend sender;
sender.setHost("localhost", 3335);

.25::second => dur T;
T - (now % T) => now;
0 => int clock;

while( true )
{
    for (0 => int i; i < 4; i++) {
        instruments[i].play(clock % 16);
    }

    if (clock % 4 == 0) {
        sender.startMsg("/clock,i");
        sender.addInt(clock);
    }

    .5::T => now;
    clock + 1 => clock;
}