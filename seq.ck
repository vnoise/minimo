class Parameter {
    float min;
    float max;
    float range;
    float value;
    float pattern[16][16];
    
    public float read(int clip, int pos) {
        return Math.max(min, Math.min(max, value + pattern[clip][pos] * range));
    }

};


class Instrument {
    SinOsc sinus;
    SawOsc saw;
    SqrOsc square;
    Noise noise;
    LPF lowpass;
    HPF hipass;
    ADSR adsr;
    Dyno comp;
    Dyno limiter;
    Dyno filterlimit;
    NRev reverb;
    DelayL delay;
    Gain feedback;
    Gain echoSend;
    Gain reverbSend;
    Gain pregain;
    Gain gain;
    Gain output;

    0 => int clip;
    0 => int position;

    comp.compress();
    limiter.limit();
    filterlimit.limit();

    0::ms => limiter.attackTime;
    0::ms => filterlimit.attackTime;
    
    0 => noise.gain;
    0 => sinus.gain;
    0 => saw.gain;
    0 => square.gain;

    1 => pregain.gain;
    
    20000 => lowpass.freq;
    0     => hipass.freq;

    1 => reverb.mix;
    0 => reverbSend.gain;
    0 => echoSend.gain;
    
    2000::ms => delay.max;
    
    adsr.set(0::ms, 100::ms, 0.0, 0::ms);

    noise  => pregain;
    sinus  => pregain;
    saw    => pregain;
    square => pregain;
    
    comp => reverbSend => reverb => limiter;
    comp => echoSend   => delay => limiter;
    
    feedback => delay => feedback;
    
    pregain => hipass => lowpass => filterlimit => adsr => comp => limiter => output;

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
    parameter("hipass", 0.1, 1, 1);
    parameter("reso", 1, 5, 5);
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
        read("reso")            => lowpass.Q => hipass.Q;
        read("reverb")          => reverbSend.gain;
        read("echo")            => echoSend.gain;
        read("echo_time")::ms   => delay.delay;
        read("feedback")        => feedback.gain;

        Std.mtof(read("pitch")) => sinus.freq;
        Std.mtof(read("pitch")) => saw.freq;
        Std.mtof(read("pitch")) => square.freq;
        
        Math.pow(read("lowpass"), 3) * 20000 => lowpass.freq;
        Math.pow(read("hipass"), 3) * 20000  => hipass.freq;

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
1.5         => compressor.gain;

compressor => limiter => dac;

Instrument i0;
Instrument i1;
Instrument i2;
Instrument i3;

i0.output => compressor;
i1.output => compressor;
i2.output => compressor;
i3.output => compressor;

[i0, i1, i2, i3] @=> Instrument instruments[];

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
spork ~ receive("/clip,ii");
spork ~ receive("/parameter,isf");

OscSend sender;
sender.setHost("localhost", 3335);

.25::second => dur T;
T - (now % T) => now;
0 => int i;

while( true )
{
    i0.play(i % 16);
    i1.play(i % 16);
    i2.play(i % 16);
    i3.play(i % 16);

    if (i % 4 == 0) {
        sender.startMsg("/clock,i");
        sender.addInt(i);
    }

    .5::T => now;
    i + 1 => i;
}