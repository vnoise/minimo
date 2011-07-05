public class Instrument {
    OscRecv receiver;
    OscSend sender;

    int clip;
    int pitch;
    int position;
    float bpm;
    int clock;
    dur beat;
    string modeName;
    string sampleName;
    string type;
    int recvPort;
    int sendPort;
    
    Mode mode;
    SinOsc sinus;
    SinOsc sinus2;
    TriOsc tri;
    TriOsc tri2;
    SawOsc saw;
    SawOsc saw2;
    PulseOsc pulse;
    PulseOsc pulse2;
    Noise noise;    
    SndBuf sample;

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

    noise  => gain;
    sinus  => gain;
    sinus2 => gain;
    tri    => gain;
    tri2   => gain;
    saw    => gain;
    saw2   => gain;
    pulse  => gain;
    pulse2 => gain;
    sample => gain;
    
    gain => lowpass => adsr => output;
    
    float pattern[8][16];
    Parameter @ parameters[16];
    
    ["volume", "attack", "decay", "pwidth", "octave",
    "pitch", "cutoff", "reso", "reverb", "delay",
    "dtime", "fback"] @=> string parameterNames[];

    parameter("volume" , 0, 0, 1, 0.5, 1);
    parameter("attack" , 1, 1, 1000, 0, 0);
    parameter("decay"  , 1, 1, 1000, 100, 0);
    parameter("pwidth" , 1, 0, 1, 0.5, 0);
    parameter("octave" , 1, 0, 6, 1, 0);
    parameter("pitch"  , 1, 0, 12, 0, 0);
    parameter("cutoff" , 0, 0.1, 1, 1, 1);
    parameter("reso"   , 0, 1, 5, 2, 0.5);
    parameter("reverb" , 0, 0, 1, 0, 0.5);
    parameter("delay"  , 0, 0, 1, 0, 0.5);
    parameter("dtime"  , 1, 0, 8, 3, 0);
    parameter("fback"  , 0, 0, 1, 0.5, 1);

    receiver.event("/bpm,f")           @=> OscEvent bpmEvent;
    receiver.event("/mode,s")          @=> OscEvent modeEvent;
    receiver.event("/type,s")          @=> OscEvent typeEvent;
    receiver.event("/sample,s")        @=> OscEvent sampleEvent;
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

        0 => noise.gain;
        0 => sinus.gain;
        0 => sinus2.gain;
        0 => tri.gain;
        0 => tri2.gain;
        0 => saw.gain;
        0 => saw2.gain;
        0 => pulse.gain;
        0 => pulse2.gain;
        0 => sample.gain;
        0 => output.gain;

        20000 => lowpass.freq;

        1 => reverb.mix;
        0.5 => reverb.gain;
        0 => reverbSend.gain;
        0 => delaySend.gain;
        
        2000::ms => delay.max;
        
        adsr.set(0::ms, 100::ms, 0.0, 0::ms);

        setType("saw");
        setMode("chromatic");
        "" => sampleName;
        
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
        
        read("volume") * 0.5    => output.gain;
        read("attack")::ms      => adsr.attackTime;
        read("decay")::ms       => adsr.decayTime;
        read("reso")            => lowpass.Q;
        read("pwidth")          => pulse.width;
        read("pwidth")          => pulse2.width;
        read("reverb")          => reverbSend.gain;
        read("delay")           => delaySend.gain;
        read("fback")           => feedback.gain;
        read("pitch") $ int     => pitch;
        read("volume")          => output.gain;

        Std.mtof(mode.note(pitch) + 24 + read("octave") * 12) =>
        pulse.freq => sinus.freq => tri.freq => saw.freq;

        if (type == "sinus_oct") {
            sinus.freq() * 2 => sinus2.freq;
        }
        else if (type == "sinus_fifth") {
            sinus.freq() * 1.5 => sinus2.freq;
        }
        else if (type == "saw_oct") {
            saw.freq() * 2 => saw2.freq;
        }
        else if (type == "saw_fifth") {
            saw.freq() * 1.5 => saw2.freq;
        }
        else if (type == "tri_oct") {
            tri.freq() * 2 => tri2.freq;
        }
        else if (type == "tri_fifth") {
            tri.freq() * 1.5 => tri2.freq;
        }
        else if (type == "pulse_oct") {
            pulse.freq() * 2 => pulse2.freq;
        }
        else if (type == "pulse_fifth") {
            pulse.freq() * 1.5 => pulse2.freq;
        }

        pitch / 12 + read("octave") => sample.rate;
        
        Math.pow(read("cutoff"), 4) * 20000 => lowpass.freq;
                
        (beat * 16) / Math.pow(2, read("dtime")) => delay.delay;        

        if (pattern[clip][position] == 1) {
            adsr.keyOff();
            adsr.keyOn();
            0 => sample.pos;
        }
    }

    public void setMode(string name) {
        name => modeName;
        mode.set(name);
    }

    public void setType(string t) {
        t => type;
        
        0 => sinus.gain => sinus2.gain =>
        tri.gain => tri.gain =>
        pulse.gain => pulse2.gain =>
        saw.gain => sample.gain => noise.gain;

        if (type == "sinus" || type == "sinus_noise") {
            1 => sinus.gain;
        }       

        if (type == "sinus_oct" || type == "sinus_fifth") {
            0.5 => sinus.gain;
            0.5 => sinus2.gain;
        }

        if (type == "pulse" || type == "pulse_saw" || type == "pulse_tri" || type == "pulse_noise") {
            0.5 => pulse.gain;
        }

        if (type == "pulse_oct" || type == "pulse_fifth") {
            0.5 => pulse.gain;
            0.5 => pulse2.gain;
        }

        if (type == "saw" || type == "pulse_saw" || type == "saw_noise") {
            0.5 => saw.gain;
        }

        if (type == "saw_oct" || type == "saw_fifth") {
            0.5 => saw.gain;
            0.5 => saw2.gain;
        }

        if (type == "tri" || type == "pulse_tri" || type == "tri_noise") {
            0.5 => tri.gain;
        }

        if (type == "tri_oct" || type == "tri_fifth") {
            0.5 => tri.gain;
            0.5 => tri2.gain;
        }

        if (type == "noise" || type == "sinus_noise" || type == "pulse_noise" || type == "saw_noise" || type == "tri_noise") {
            0.5 => noise.gain;
        }

        if (type == "sample") {
            1 => sample.gain;
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
                typeEvent.getString() => string key;                    
                setType(key);                    
                // <<< "type", key >>>;
            }
        }
    }
    
    public void receiveSample() {
        while (true) {
            sampleEvent => now;            
            while (sampleEvent.nextMsg() != 0) {
                sampleEvent.getString() => sampleName;                    
                sample.read("./samples/" + sampleName);
                // <<< "sample", sampleName >>>;
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
        spork ~ receiveSample();
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
        
        sender.startMsg("/type,s");
        sender.addString(type);

        sender.startMsg("/sample,s");
        sender.addString(sampleName);

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
