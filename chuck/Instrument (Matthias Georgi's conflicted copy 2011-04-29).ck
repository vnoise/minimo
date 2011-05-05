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
    SawOsc saw;
    SqrOsc square;
    Noise noise;    
    SndBuf sample;

    LPF lowpass;
    ADSR adsr;    
    Dyno output;    
    NRev reverb;
    DelayL delay;
    
    Gain feedback;
    Gain echoSend;
    Gain reverbSend;
    Gain gain;

    output.compress();
    
    adsr => reverbSend => reverb => output;
    adsr => echoSend   => delay => output;
    
    feedback => delay => feedback;

    noise  => gain;
    sinus  => gain;
    saw    => gain;
    square => gain;
    sample => gain;
    
    gain => lowpass => adsr => output => dac;
    
    float pattern[8][16];
    Parameter @ parameters[16];
    
    ["volume", "attack", "decay", "octave",
    "pitch", "lowpass", "reso", "reverb", "echo",
    "echo_time", "feedback"] @=> string parameterNames[];

    parameter("volume", 0, 1, 0.5);
    parameter("attack", 1, 500, 1);
    parameter("decay", 1, 500, 200);
    parameter("octave", 0, 6, 2);
    parameter("pitch", 0, 12, 0);
    parameter("lowpass", 0, 1, 1);
    parameter("reso", 1, 5, 1);
    parameter("reverb", 0, 1, 0);
    parameter("echo", 0, 1, 0);
    parameter("echo_time", 0, 8, 2);
    parameter("feedback", 0, 1, 0.5);

    receiver.event("/bpm,f")           @=> OscEvent bpmEvent;
    receiver.event("/mode,s")          @=> OscEvent modeEvent;
    receiver.event("/type,s")          @=> OscEvent typeEvent;
    receiver.event("/sample,s")        @=> OscEvent sampleEvent;
    receiver.event("/clip,i")          @=> OscEvent clipEvent;
    receiver.event("/parameter,sf")    @=> OscEvent parameterEvent;
    receiver.event("/automation,sif")  @=> OscEvent automationEvent;
    receiver.event("/pattern,iif")     @=> OscEvent patternEvent;
    receiver.event("/update")          @=> OscEvent updateEvent;
    
    public void parameter(string key, float min, float max, float value) {
        new Parameter @=> Parameter @ param;
        param @=> parameters[key];
        min => param.min;
        max => param.max;
        value => param.value;
        param.init();
    }

    public void init() {
        0 => clip;
        0 => position;
        120 => bpm;
        minute / bpm / 4 => beat;
        0 => clock;

        0 => noise.gain;
        0 => sinus.gain;
        0 => saw.gain;
        0 => square.gain;
        0 => sample.gain;
        0 => output.gain;

        20000 => lowpass.freq;

        1 => reverb.mix;
        0.5 => reverb.gain;
        0 => reverbSend.gain;
        0 => echoSend.gain;
        
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
        
        read("volume")          => output.gain;
        read("attack")::ms      => adsr.attackTime;
        read("decay")::ms       => adsr.decayTime;
        read("reso")            => lowpass.Q;
        read("reverb")          => reverbSend.gain;
        read("echo")            => echoSend.gain;
        read("feedback")        => feedback.gain;
        read("pitch") $ int     => pitch;
        read("volume")          => output.gain;

        Std.mtof(mode.note(pitch) + 36 + read("octave") * 12) => sinus.freq => saw.freq => square.freq;

        pitch / 12 + read("octave") => sample.rate;
        
        Math.pow(read("lowpass"), 4) * 20000 => lowpass.freq;
        
        (beat * 16) / Math.pow(2, read("echo_time")) => delay.delay;        

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

    public void setType(string _type) {
        _type => type;
        
        0 => sinus.gain => saw.gain => square.gain => sample.gain => noise.gain;

        if (_type == "sinus" ) 1 => sinus.gain;
        if (_type == "saw"   ) 0.3 => saw.gain;
        if (_type == "square") 0.3 => square.gain;
        if (_type == "noise" ) 0.3 => noise.gain;
        if (_type == "sample") 1 => sample.gain;
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
                sample.read("./samples/" + sampleName + ".wav");                    
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
                if (pos >= 0 && pos < 16) {
                    value => parameters[key].pattern[pos];
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
                value => parameters[key].value;                    
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

            // if (clock % 16 == 0) {
                sender.startMsg("/clock,if");
                sender.addInt(clock);
                sender.addFloat(bpm);
            // }

            beat => now;
        }
    }

}
