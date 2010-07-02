
public class Instrument {
    OscRecv receiver;
    OscSend sender;
    
    int clip;
    int pitch;
    int position;
    float bpm;
    int clock;
    dur beat;
    0 => int port;

    Mode mode;
    SinOsc sinus;
    SawOsc saw;
    SqrOsc square;
    Noise noise;    
    LPF lowpass;
    HPF hipass;    
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
    
    gain => hipass => lowpass => adsr => output => dac;
    
    float pattern[16][16];
    Parameter @ parameters[16];

    parameter("volume", 0, 1);
    parameter("attack", 1, 500);
    parameter("decay", 1, 500);
    parameter("octave", 0, 6);
    parameter("pitch", 0, 12);
    parameter("lowpass", 0.1, 1);
    parameter("hipass", 0, 1);
    parameter("reso", 0, 5);
    parameter("reverb", 0, 1);
    parameter("echo", 0, 1);
    parameter("echo_time", 0, 8);
    parameter("feedback", 0, 1);
    
    sender.setHost("localhost", 9999);

    public void parameter(string key, float min, float max) {
        new Parameter @=> Parameter @ param;
        param @=> parameters[key];
        min => param.min;
        max => param.max;
        0 => param.value;
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
        0 => output.gain;

        20000 => lowpass.freq;
        0     => hipass.freq;

        1 => reverb.mix;
        0.5 => reverb.gain;
        0 => reverbSend.gain;
        0 => echoSend.gain;
        
        2000::ms => delay.max;
        
        adsr.set(0::ms, 100::ms, 0.0, 0::ms);

        mode.set("chromatic");
                
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
        
        Math.pow(read("lowpass"), 4) * 20000 => lowpass.freq;
        Math.pow(read("hipass"), 4) * 20000  => hipass.freq;
        
        (beat * 16) / Math.pow(2, read("echo_time")) => delay.delay;        

        if (pattern[clip][position] == 1) {
            adsr.keyOff();
            adsr.keyOn();
        }
    }

    public void setType(string type) {              
        0 => sinus.gain => saw.gain => square.gain => noise.gain;

        if (type == "sinus" ) 1 => sinus.gain;
        if (type == "saw"   ) 0.3 => saw.gain;
        if (type == "square") 0.3 => square.gain;
        if (type == "noise" ) 0.3 => noise.gain;
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
                    minute / bpm / 4 => beat;

                    <<< address, bpm >>>;
                }
                
                if (address == "/pattern,iif") {
                    e.getInt() => int i;
                    e.getInt() => int j;
                    e.getFloat() => float value;

                    value => pattern[i][j];

                    <<< address, i, j, value >>>;
                }
                
                if (address == "/mode,s") {
                    e.getString() => string key;
                    
                    mode.set(key);
                    
                    <<< address, key >>>;
                }
                
                if (address == "/type,s") {
                    e.getString() => string key;
                    
                    setType(key);
                    
                    <<< address, key >>>;
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
        spork ~ receive("/mode,s");
        spork ~ receive("/type,s");
        spork ~ receive("/slider,sfff");
        spork ~ receive("/clip,i");
        spork ~ receive("/parameter,sf");
        spork ~ receive("/automation,siif");
        spork ~ receive("/pattern,iif");

        <<< "Listening on port", port >>>;
    }

    public void loop() {        
        (beat * 16) - (now % (beat * 16)) => now;
        (now / beat) $ int => clock;

        <<< "Starting loop on", clock >>>;

        while( true )
        {
            (now / beat) $ int => clock;
            
            play(clock % 16);

            if (port == 10000 && clock % 4 == 0) {
                sender.startMsg("/clock,if");
                sender.addInt(clock);
                sender.addFloat(bpm);
            }

            beat => now;
        }
    }

}
