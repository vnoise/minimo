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
    OscRecv receiver;
    OscSend sender;
    
    int clip;
    int position;    
    float bpm;
    int clock;
    dur beat;
    0 => int port;

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

    osclimit => hipass => hplimit => lowpass => lplimit => adsr => comp => limiter => output => dac;

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
    
    sender.setHost("localhost", 9999);

    public void parameter(string key, float min, float max, float range) {
        new Parameter @=> Parameter @ param;
        param @=> parameters[key];
        min => param.min;
        max => param.max;
        range => param.range;
        0 => param.value;
    }

    public void init() {
        0 => clip;
        0 => position;
        120 => bpm;
        60::second / bpm => beat;
        0 => clock;

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

        Math.min(0.8, 1 / (read("sinus") + read("saw") + read("square") + read("noise"))) => osclimit.gain;

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

    public void receive(string address) {
        receiver.event(address) @=> OscEvent e;
        
        while (true) {
            e => now;
            
            while (e.nextMsg() != 0) {
                if (address == "/instrument") {
                    init();
                    <<< address >>>;
                }

                if (address == "/bpm,f") {
                    e.getFloat() => bpm;
                    
                    <<< address, bpm >>>;
                }
                
                if (address == "/pattern,iif") {
                    e.getInt() => int i;
                    e.getInt() => int j;
                    e.getFloat() => float value;

                    value => pattern[i][j];

                    <<< address, i, j, value >>>;
                }
                
                if (address == "/slider,sfff") {
                    e.getString() => string key;
                    e.getFloat() => float min;
                    e.getFloat() => float max;
                    e.getFloat() => float step;
                    
                    parameters[key].init(min, max);
                    
                    <<< address, key, min, max, step >>>;
                }

                if (address == "/clip,i") {
                    e.getInt() => clip;

                    <<< address, clip >>>;
                }
                
                if (address == "/automation,siif") {
                    e.getString() => string key;
                    e.getInt() => int clip;
                    e.getInt() => int pos;
                    e.getFloat() => float value;

                    value => parameters[key].pattern[clip][pos];

                    <<< address, key, clip, pos, value >>>;
                }

                if (address == "/parameter,sf") {
                    e.getString() => string key;
                    e.getFloat() => float value;
                    
                    value => parameters[key].value;
                    
                    <<< address, key, value >>>;
                }
            }
        }
    }

    public void listen() {     
        port => receiver.port;
        receiver.listen();

        spork ~ receive("/bpm,f");
        spork ~ receive("/instrument");
        spork ~ receive("/slider,sfff");
        spork ~ receive("/clip,i");
        spork ~ receive("/parameter,sf");
        spork ~ receive("/automation,siif");
        spork ~ receive("/pattern,iif");

        <<< "Listening on port", port >>>;
    }

    public void loop() {        
        (beat * 4) - (now % (beat * 4)) => now;

        <<< "Starting loop on", now >>>;

        while( true )
        {
            play(clock % 16);

            if (port == 10000 && clock % 4 == 0) {
                sender.startMsg("/clock,if");
                sender.addInt(clock);
                sender.addFloat(bpm);
            }

            60::second / bpm / 4 => dur beat;
            beat => now;
            clock + 1 => clock;
        }
    }

}

OscRecv portReceiver;
9998 => portReceiver.port;
portReceiver.listen();

Instrument instrument;
instrument.init();

portReceiver.event("/port,i") @=> OscEvent e;

while (true) {
    e => now;    
    while (e.nextMsg() != 0) {
        e.getInt() => instrument.port;
        instrument.listen();
        instrument.loop();
    }
}

