class Instrument {
    SinOsc sinus;
    Noise noise;
    ADSR adsr;
    Gain gain;
    Gain output;

    0::ms => dur attack;
    100::ms => dur decay;
    80 => float freq;
    0 => int clip;
    
    float pattern[16][16];
    float automationAttack[16][16];
    float automationDecay[16][16];
    float automationFreq[16][16];

    noise => adsr;
    sinus => adsr;
    adsr => gain => output;
    0 => noise.gain;
    0 => sinus.gain;

    adsr.set(0::ms, 100::ms, 0.0, 0::ms);

    public void play(int pos) {
        pattern[clip][pos] => float level;
        
        attack + automationAttack[clip][pos] * 500::ms => adsr.attackTime;
        decay + automationDecay[clip][pos] * 500::ms => adsr.decayTime;
        freq + automationFreq[clip][pos] * freq => sinus.freq;

        if (level > 0) {
            level => gain.gain;         
            
            adsr.keyOff();
            adsr.keyOn();
        }
    }
    
    public void connect(UGen ugen) {
        output => ugen;
    }
}

Instrument snare;
Instrument bassdrum;
Instrument hihat;

snare.connect(dac);
bassdrum.connect(dac);
hihat.connect(dac);

[bassdrum, snare, hihat] @=> Instrument instruments[];

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
                
                if (key == "freq") {
                    value => instrument.automationFreq[clip][pos];
                }
                
                if (key == "attack") {
                    value => instrument.automationAttack[clip][pos];
                }
                
                if (key == "decay") {
                    value => instrument.automationDecay[clip][pos];
                }

                <<< address, index, key, clip, pos, value >>>;
            }

            if (address == "/parameter,isf") {
                e.getString() => string parameter;
                e.getFloat() => float value;

                if (parameter == "volume") {
                    value => instrument.output.gain;
                }

                if (parameter == "noise") {
                    value => instrument.noise.gain;
                }

                if (parameter == "sinus") {
                    value => instrument.sinus.gain;
                }

                if (parameter == "freq") {
                    value => instrument.freq;
                }
                
                if (parameter == "attack") {
                    value::ms => instrument.attack;
                }
                
                if (parameter == "decay") {
                    value::ms => instrument.decay;
                }

                <<< address, index, parameter, value >>>;
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
    bassdrum.play(i % 16);
    snare.play(i % 16);
    hihat.play(i % 16);

    if (i % 4 == 0) {
        sender.startMsg("/clock,i");
        sender.addInt(i);
    }

    .5::T => now;
    i + 1 => i;
}