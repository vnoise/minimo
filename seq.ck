
class Mode
{
    [0] @=> int intervals[]; // array of intervals in the mode
    0 => int octaveSize; // octave size in semitones
    0 => int rootPosition; // for easy mode rotation
    
    // - - - Initialization
    fun int update()
    {
        // use this to octave Octave Size
        0 => octaveSize;
        for(int i; i < intervals.cap(); i++) intervals[i] +=> octaveSize;
        return octaveSize;
    }
    fun void set(int input[])
    {
        // use this to copy intervals from the input array
        new int[input.cap()] @=> intervals;
        for(int i; i < input.cap(); i++) input[i] => intervals[i];
        update();
    }
    fun void set(string input)
    {
        // use this to set the mode to a preset value by a string
        if (input == "lydian") set([2,2,2,1,2,2,1]);
        if (input == "ionian") set([2,2,1,2,2,2,1]);
        if (input == "mixolydian") set([2,2,1,2,2,1,2]);
        if (input == "dorian") set([2,1,2,2,2,1,2]);
        if (input == "aeolian") set([2,1,2,2,1,2,2]);
        if (input == "phrygian") set([1,2,2,2,1,2,2]);
        if (input == "locrian") set([1,2,2,1,2,2,2]);
       
        if (input == "harmonic minor") set([2,1,2,2,1,3,1]);
        if (input == "melodic minor") set([2,1,2,2,2,2,1]);
        
        if (input == "major pentatonic") set([2, 2, 3, 2, 3]);
        if (input == "minor pentatonic") set([3, 2, 2, 3, 2]);
        
        if (input == "wholetone") set([2,2,2,2,2,2]);
        if (input == "whole-half") set([2,1]);
        if (input == "half-whole") set([1,2]);
        // maybe this is a joke or something, but theoretically, yes it is this..
        if (input == "chromatic") set([1]); 
        update();
    }
    fun void get(int input[])
    {
        // use this to copy to an outside array        
        for(int i; i < input.cap() && i < intervals.cap(); i++) intervals[i] => input[i];
    }
   
    // - - - Acquiring note
    fun int note(int pitch)
    {
        // use this to acquire note (calculated in semitones) from the mode
        // without octave input
        pitch--; // so user can start the first pitch from 1 instead of 0
        0 => int octave; // but we still have to use octave if pitch is negative
        
        // calculate pitch and octave for use the intervals array
        // by limiting pitch in rang 0..intervals.cap()-1 and adjust octave number
        if (pitch < 0) octave--;
        pitch / intervals.cap() +=> octave;
        (pitch - (pitch / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => pitch;
       
        0 => int sum;
        // calculate semitones for the pitch
        // with rootPosition for easy mode rotation
        for(int i; i < pitch; i++) intervals[(i + rootPosition) % intervals.cap()] +=> sum; 
        octave * octaveSize +=> sum; // select desired octave
        return sum; // and we'll have the result in semitone
    }
    fun int note(int pitch, int octave)
    {
        // note, with octave number also
        return note(pitch) + octave * octaveSize;
    }   
   
    // - - - RotationZ
    fun void rotate(int x)
    {
        // rotate the mode x times
        x +=> rootPosition;
        (rootPosition - (rootPosition / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => rootPosition;
    }
     fun void setRotate(int x)
    {
        // reset rotation point to x
        x => rootPosition;
        (rootPosition - (rootPosition / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => rootPosition;
    }
    fun void rotateApply()
    {
        // update current rotation into the interval array
        int dummy[intervals.cap()];        
        (rootPosition - (rootPosition / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => rootPosition;
        for(int i; i < intervals.cap(); i++) intervals[(i + rootPosition) % intervals.cap()] => dummy[i];
        for(int i; i < intervals.cap(); i++) dummy[i] => intervals[i];
        0 => rootPosition; // and clear the rootPosition
    }
    fun void rotateApply(int x)
    {
        // move root position to x and update current rotation into the interval array right away
        setRotate(x);
        rotateApply();
    }
    
    // - - - Chord Formation
    fun void chord(int root, int degree[], int result[])
    {
        // make a chord from position list (chord degrees)
        for(int i; i < degree.cap() && i < result.cap(); i++)
        {
            note(root-1 + degree[i]) => result[i];
        }
    }
    fun void chord(int root, int octave, int degree[], int result[])
    {
        // make a chord from position list, with octave
        for(int i; i < degree.cap() && i < result.cap(); i++)
        {
            note(root-1 + degree[i]) + octave * octaveSize => result[i];
        }
    }
    
    // - - - Operation
    fun void retrograde()
    {
        int dummy;
        // swap all the left part with all the right part: an easy way to retrograde
        for(int i; i < intervals.cap()/2; i++)
        {
            intervals[i] => dummy;
            intervals[intervals.cap()-1 - i] => intervals[i];
            dummy => intervals[intervals.cap()-1 - i];
        }
    }
    fun void invert()
    {
        // this is one thing we should have: invertion of the intervals
        for(int i; i < intervals.cap(); i++) -1 *=> intervals[i];
        update();
    }
    fun void trim(int begin, int end)
    {
        // this can trim the interval array by selecting a section.
        // but we should prevent array-out-of-bound
        end++;
        if (begin < 0) 0 => begin;
        if (end >= intervals.cap()) intervals.cap()-1 => end;
        if (begin > end) 0 => begin => end;
        int dummy[end-begin];
        // start trimming
        for(int i; i < end-begin; i++) intervals[begin + i] => dummy[i];
        set(dummy); // and it's all done
    }
    
    fun void addLeft(int input[])
    {
        // add a new set of intervals in front of the current array
        int dummy[intervals.cap() + input.cap()];
        for(int i; i < input.cap(); i++) input[i] => dummy[i];
        for(int i; i < intervals.cap(); i++) intervals[i] => dummy[input.cap() + i];
        set(dummy); // and it's all done
        <<< intervals.cap() >>>;
    }
    fun void addRight(int input[])
    {
        // add a new set of intervals in front of the current array
        int dummy[intervals.cap() + input.cap()];
        for(int i; i < intervals.cap(); i++) intervals[i] => dummy[i];
        for(int i; i < input.cap(); i++) input[i] => dummy[intervals.cap() + i];
        set(dummy); // and it's all done
        <<< intervals.cap() >>>;
    }
    fun void addValue(int input[])
    {
        // add a set of values to the original intervals
        for(int i; i < intervals.cap() && i < input.cap(); i++) input[i] +=> intervals[i];
        update();
    }
    fun void addValue(int input[], int offset)
    {
        // addValue with offset
        (offset - (offset / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => offset;
        for(int i; i < intervals.cap() && i < input.cap(); i++) input[i] +=> intervals[(i + offset) % intervals.cap()];
        update();
    }
    fun void subtractValue(int input[])
    {
        // subtract a set of values to the original intervals
        for(int i; i < intervals.cap() && i < input.cap(); i++) input[i] -=> intervals[i];
        update();
    }
    fun void subtractValue(int input[], int offset)
    {
        // subtractValue with offset
        (offset - (offset / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => offset;
        for(int i; i < intervals.cap() && i < input.cap(); i++) input[i] -=> intervals[(i + offset) % intervals.cap()];
        update();
    }
    fun void multiplyValue(int input[])
    {
        // multiply a set of values to the original intervals
        for(int i; i < intervals.cap() && i < input.cap(); i++) input[i] *=> intervals[i];
        update();
    }
    fun void multiplyValue(int input[], int offset)
    {
        // multiplyValue with offset
        (offset - (offset / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => offset;
        for(int i; i < intervals.cap() && i < input.cap(); i++) input[i] *=> intervals[(i + offset) % intervals.cap()];
        update();
    }
    fun void divideValue(int input[])
    {
        // divide a set of values from the original intervals
        // division by zero will result in no change
        for(int i; i < intervals.cap() && i < input.cap(); i++)
            if (input[i] != 0) input[i] /=> intervals[i];
        update();
    }
    fun void divideValue(int input[], int offset)
    {
        // divideValue with offset
        // division by zero will result in no change
        (offset - (offset / intervals.cap() - 1) * intervals.cap()) % intervals.cap() => offset;
        for(int i; i < intervals.cap() && i < input.cap(); i++)
            if (input[i] != 0) input[i] /=> intervals[(i + offset) % intervals.cap()];
        update();
    }        
}

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
    int pitch;
    int octave;
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

    parameter("volume", 0, 1, 1);
    parameter("attack", 1, 500, 500);
    parameter("decay", 1, 500, 500);
    parameter("octave", 0, 6, 1);
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
        read("echo_time")::ms   => delay.delay;
        read("feedback")        => feedback.gain;
        read("pitch") $ int     => pitch;
        read("octave") $ int    => octave;        
        read("volume")          => output.gain;

        Std.mtof(mode.note(pitch) + 36 + octave * 12) => sinus.freq => saw.freq => square.freq;
        
        Math.pow(read("lowpass"), 4) * 20000 => lowpass.freq;
        Math.pow(read("hipass"), 4) * 20000  => hipass.freq;

        if (pattern[clip][position] == 1) {
            adsr.keyOff();
            adsr.keyOn();
        }
    }

    public void setType(string type) {              
        0 => sinus.gain => saw.gain => square.gain => noise.gain;

        if (type == "sinus" ) 1 => sinus.gain;
        if (type == "saw"   ) 1 => saw.gain;
        if (type == "square") 1 => square.gain;
        if (type == "noise" ) 1 => noise.gain;
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

