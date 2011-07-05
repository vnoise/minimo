public class Instrument {
    OscRecv receiver;
    OscSend sender;

    int clip;
    int pitch;
    float detune;
    int pitch1;
    int pitch2;
    int position;
    float bpm;
    int clock;
    dur beat;
    string modeName;
    string type1;
    string type2;
    int recvPort;
    int sendPort;
    
    Mode mode;
    SinOsc sinus1;
    SinOsc sinus2;
    TriOsc tri1;
    TriOsc tri2;
    SawOsc saw1;
    SawOsc saw2;
    PulseOsc pulse1;
    PulseOsc pulse2;
    Noise noise1;
    Noise noise2;

    LPF lowpass;
    ADSR adsr;    
    Dyno output;    
    NRev reverb;
    DelayL delay;
    FullRect rect;
    
    Gain feedback;
    Gain delaySend;
    Gain reverbSend;
    Gain gain;

    output.compress();

    adsr => reverbSend => reverb => output;
    adsr => delaySend   => delay => output;
    
    feedback => delay => feedback;

    noise1 => gain;
    noise2 => gain;
    sinus1 => gain;
    sinus2 => gain;
    tri1   => gain;
    tri2   => gain;
    saw1   => gain;
    saw2   => gain;
    pulse1 => gain;
    pulse2 => gain;
    
    gain => lowpass => adsr => output;
    
    float pattern[8][16];
    Parameter @ parameters[16];
    
    ["volume", "attack", "decay", "sustain", "release", "pwidth", "octave",
    "pitch", "detune", "cutoff", "reso", "reverb", "delay",
    "dtime", "fback"] @=> string parameterNames[];

    parameter("volume" , 0, 0, 1, 0.5, 1);
    parameter("attack" , 1, 1, 1000, 0, 0);
    parameter("decay"  , 1, 1, 1000, 100, 0);
    parameter("sustain", 0, 0, 1, 1, 0.5);
    parameter("release", 1, 1, 1000, 100, 0);
    parameter("pwidth" , 1, 0, 1, 0.5, 0);
    parameter("octave" , 1, 0, 6, 1, 0);
    parameter("pitch"  , 1, 0, 12, 0, 0);
    parameter("detune" , 1, 0, 0.05, 0, 0);
    parameter("cutoff" , 0, 0.1, 1, 1, 1);
    parameter("reso"   , 0, 1, 5, 2, 0.5);
    parameter("reverb" , 0, 0, 1, 0, 0.5);
    parameter("delay"  , 0, 0, 1, 0, 0.5);
    parameter("dtime"  , 1, 0, 8, 3, 0);
    parameter("fback"  , 0, 0, 1, 0.5, 1);

    receiver.event("/bpm,f")           @=> OscEvent bpmEvent;
    receiver.event("/mode,s")          @=> OscEvent modeEvent;
    receiver.event("/type,is")         @=> OscEvent typeEvent;
    receiver.event("/pitch,ii")        @=> OscEvent pitchEvent;
    receiver.event("/clip,i")          @=> OscEvent clipEvent;
    receiver.event("/parameter,sf")    @=> OscEvent parameterEvent;
    receiver.event("/automation,sif")  @=> OscEvent automationEvent;
    receiver.event("/pattern,iif")     @=> OscEvent patternEvent;
    receiver.event("/update")          @=> OscEvent updateEvent;
    
    public void parameter(string key, int type, float min, float max, float value, float pattern) {
        new Parameter @=> Parameter @ param;
        param @=> parameters[key];
        type => param.type;
        min => param.min;
        max => param.max;
        value => param.value;
        param.init(pattern);
    }

    public void init() {
        0 => clip;
        0 => position;
        120 => bpm;
        minute / bpm / 4 => beat;
        0 => clock;

        0 => noise1.gain;
        0 => noise2.gain;
        0 => sinus1.gain;
        0 => sinus2.gain;
        0 => tri1.gain;
        0 => tri2.gain;
        0 => saw1.gain;
        0 => saw2.gain;
        0 => pulse1.gain;
        0 => pulse2.gain;
        0 => output.gain;

        20000 => lowpass.freq;

        1 => reverb.mix;
        0.5 => reverb.gain;
        0 => reverbSend.gain;
        0 => delaySend.gain;
        
        2000::ms => delay.max;
        
        adsr.set(0::ms, 100::ms, 0.0, 0::ms);

        0 => pitch1;
        0 => pitch2;
        setType1("sinus");
        setType2("sinus");
        setMode("phrygian");
        
        for (0 => int i; i < 8; i++) {
            for (0 => int j; j < 16; j++) {
                0 => pattern[i][j];
            }
        }
    }

    public float read(string key) {
        return parameters[key].read(position);
    }
    
    public void play(int pos) {
        pos => position;
        
        read("volume") * 0.2    => output.gain;
        read("attack")::ms      => adsr.attackTime;
        read("decay")::ms       => adsr.decayTime;
        read("release")::ms     => adsr.releaseTime;
        read("sustain")         => adsr.sustainLevel;
        read("reso")            => lowpass.Q;
        read("pwidth")          => pulse1.width;
        read("pwidth")          => pulse2.width;
        read("reverb")          => reverbSend.gain;
        read("delay")           => delaySend.gain;
        read("fback")           => feedback.gain;
        read("pitch") $ int     => pitch;
        read("detune")          => detune;
        read("volume")          => output.gain;

        Std.mtof(mode.note(pitch) + pitch1 + 24 + read("octave") * 12) * (1 + detune) =>
        sinus1.freq => tri1.freq => saw1.freq => pulse1.freq;
        
        Std.mtof(mode.note(pitch) + pitch2 + 24 + read("octave") * 12) * (1 - detune) =>
        sinus2.freq => tri2.freq => saw2.freq => pulse2.freq;
        
        Math.pow(read("cutoff"), 4) * 20000 => lowpass.freq;
                
        (beat * 16) / Math.pow(2, read("dtime")) => delay.delay;        

        if (pattern[clip][position] == 1) {
            adsr.keyOn();
        }
        else {
            adsr.keyOff();
        }
    }

    public void setMode(string name) {
        name => modeName;
        mode.set(name);
    }

    public void setType1(string t) {
        t => type1;
        
        0 => sinus1.gain => tri1.gain => pulse1.gain => saw1.gain => noise1.gain;

        if (type1 == "sinus") {
            0.5 => sinus1.gain;
        }
        else if (type1 == "pulse") {
            0.5 => pulse1.gain;
        }
        else if (type1 == "saw") {
            0.5 => saw1.gain;
        }
        else if (type1 == "tri") {
            0.5 => tri1.gain;
        }
        else if (type1 == "noise") {
            0.5 => noise1.gain;
        }
    }

    public void setType2(string t) {
        t => type2;
        
        0 => sinus2.gain => tri2.gain => pulse2.gain => saw2.gain => noise2.gain;

        if (type2 == "sinus") {
            0.5 => sinus2.gain;
        }
        else if (type2 == "pulse") {
            0.5 => pulse2.gain;
        }
        else if (type2 == "saw") {
            0.5 => saw2.gain;
        }
        else if (type2 == "tri") {
            0.5 => tri2.gain;
        }
        else if (type2 == "noise") {
            0.5 => noise2.gain;
        }
    }

    public void receiveUpdate() {        
        while (true) {
            updateEvent => now;            
            while (updateEvent.nextMsg() != 0) {
                sendUpdates();                    
                // <<< "update" >>>;
            }                   
        }
    }

    public void receiveBpm() {        
        while (true) {
            bpmEvent => now;            
            while (bpmEvent.nextMsg() != 0) {              
                bpmEvent.getFloat() => bpm;
                minute / bpm / 4 => beat;
                // <<< "bpm", bpm >>>;
            }
        }
    }
    
    public void receivePattern() {
        while (true) {
            patternEvent => now;            
            while (patternEvent.nextMsg() != 0) {              
                patternEvent.getInt() => int clip;
                patternEvent.getInt() => int pos;
                patternEvent.getFloat() => float value;
                if (clip >= 0 && clip < 8 && pos >= 0 && pos < 16) {
                    value => pattern[clip][pos];
                }
                // <<< "pattern", clip, pos, value >>>;
            }
        }
    }
    
    public void receiveMode() {
        while (true) {
            modeEvent => now;            
            while (modeEvent.nextMsg() != 0) {              
                modeEvent.getString() => string name;
                setMode(name);
                // <<< "mode", name >>>;
            }
        }
    }
    
    public void receiveType() {
        while (true) {
            typeEvent => now;            
            while (typeEvent.nextMsg() != 0) {
                typeEvent.getInt() => int i;
                typeEvent.getString() => string key;

                if (i == 1) {
                    setType1(key);
                }
                else if (i == 2) {
                    setType2(key);
                }
                // <<< "type", key >>>;
            }
        }
    }
    
    public void receivePitch() {
        while (true) {
            pitchEvent => now;            
            while (pitchEvent.nextMsg() != 0) {
                pitchEvent.getInt() => int i;
                pitchEvent.getInt() => int p;
                
                if (i == 1) {
                    p => pitch1;
                }
                else if (i == 2) {
                    p => pitch2;
                }
                // <<< "type", key >>>;
            }
        }
    }

    public void receiveClip() {
        while (true) {
            clipEvent => now;            
            while (clipEvent.nextMsg() != 0) {
                clipEvent.getInt() => clip;                
                // <<< "clip", clip >>>;
            }
        }
    }
    
    public void receiveAutomation() {
        while (true) {
            automationEvent => now;            
            while (automationEvent.nextMsg() != 0) {
                automationEvent.getString() => string key;
                automationEvent.getInt() => int pos;
                automationEvent.getFloat() => float value;
                parameters[key] @=> Parameter @ param;

                if (param != null) {
                    if (pos >= 0 && pos < 16) {
                        value => param.pattern[pos];
                    }
                }
                // <<< "automation", key, clip, pos, value >>>;
            }
        }
    }

    public void receiveParameter() {
        while (true) {
            parameterEvent => now;            
            while (parameterEvent.nextMsg() != 0) {
                parameterEvent.getString() => string key;
                parameterEvent.getFloat() => float value;                    
                parameters[key] @=> Parameter @ param;

                if (param != null) {
                    value => param.value;
                }
                // <<< "parameter", key, value >>>;
            }
        }
    }

    public void listen() {
        sender.setHost("localhost", sendPort);
        recvPort => receiver.port;
        receiver.listen();

        spork ~ receiveBpm();
        spork ~ receiveMode();
        spork ~ receiveType();
        spork ~ receivePitch();
        spork ~ receiveClip();
        spork ~ receiveParameter();
        spork ~ receiveAutomation();
        spork ~ receivePattern();
        spork ~ receiveUpdate();

        <<< "Sending on port", sendPort >>>;
        <<< "Receiving on port", recvPort >>>;
    }

    public void sendUpdates() {
        for (0 => int clip; clip < 8; clip++) {
            for (0 => int pos; pos < 16; pos++) {
                sender.startMsg("/pattern,iif");
                sender.addInt(clip);
                sender.addInt(pos);
                sender.addFloat(pattern[clip][pos]);
            }
        }

        for (0 => int i; i < parameterNames.cap(); i++) {
            parameterNames[i] => string key;
            parameters[key].value => float value;
            sender.startMsg("/parameter,sf");
            sender.addString(key);
            sender.addFloat(value);
        }

        for (0 => int i; i < parameterNames.cap(); i++) {
            parameterNames[i] => string key;
            for (0 => int pos; pos < 16; pos++) {
                parameters[key].pattern[pos] => float value;
                sender.startMsg("/automation,sif");
                sender.addString(key);
                sender.addInt(pos);
                sender.addFloat(value);
            }
        }

        sender.startMsg("/mode,s");
        sender.addString(modeName);
        
        sender.startMsg("/type,is");
        sender.addInt(1);
        sender.addString(type1);

        sender.startMsg("/type,is");
        sender.addInt(2);
        sender.addString(type2);
        
        sender.startMsg("/pitch,ii");
        sender.addInt(1);
        sender.addInt(pitch1);

        sender.startMsg("/pitch,ii");
        sender.addInt(2);
        sender.addInt(pitch2);

        sender.startMsg("/clip,i");
        sender.addInt(clip);
    }

    public void loop() {
        listen();
        
        (beat * 16) - (now % (beat * 16)) => now;
        (now / beat) $ int => clock;

        <<< "Starting loop on", clock >>>;

        while( true )
        {
            (now / beat) $ int => clock;
                        
            play(clock % 16);

            sender.startMsg("/clock,if");
            sender.addInt(clock);
            sender.addFloat(bpm);

            beat => now;
        }
    }

}
