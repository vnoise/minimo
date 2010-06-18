class Instrument {
    SinOsc sinus;
    Noise noise;
    LPF lowpass;
    ADSR adsr;
    Dyno comp;
    PRCRev reverb;
    DelayL delay;
    Gain feedbackGain;
    Gain echoSend;
    Gain reverbSend;
    Gain gain;
    Gain output;

    0::ms       => dur attack;
    100::ms     => dur decay;
    80          => float pitch;
    80          => float cutoff;
    80          => float reso;
    0           => float reverbMix;
    0           => float echoMix;
    0           => float feedback;
    0.5::second => dur echoTime;
    0           => int clip;
    0.5         => float sinusLevel;
    0.5         => float noiseLevel;
    0.5         => comp.slopeAbove;
    1.0         => comp.slopeBelow;
    0.5         => comp.thresh;
    5::ms       => comp.attackTime;
    50::ms      => comp.releaseTime;
    0.8         => comp.gain;
    
    float pattern[16][16];
    float automationSinus[16][16];
    float automationNoise[16][16];
    float automationAttack[16][16];
    float automationDecay[16][16];
    float automationPitch[16][16];
    float automationCutoff[16][16];
    float automationReso[16][16];
    float automationReverb[16][16];
    float automationEcho[16][16];
    float automationFeedback[16][16];
    float automationEchoTime[16][16];

    noise => lowpass;
    sinus => lowpass;
    adsr => reverbSend => reverb => comp;
    adsr => echoSend => delay => comp;
    feedbackGain => delay => feedbackGain;
    
    lowpass => adsr => comp => gain => output;
    
    0.5 => noise.gain;
    0.5 => sinus.gain;
    
    0.5 => lowpass.gain;
    10000 => lowpass.freq;
    1 => lowpass.Q;

    1 => reverb.mix;
    0 => reverbSend.gain;
    
    2000::ms => delay.max;    
    1000::ms => delay.delay;
    0 => echoSend.gain;        

    adsr.set(0::ms, 100::ms, 0.0, 0::ms);
    
    public void play(int pos) {
        pattern[clip][pos] => float level;
        
        sinusLevel + automationSinus[clip][pos] => sinus.gain;
        noiseLevel + automationNoise[clip][pos] => noise.gain;
        attack + automationAttack[clip][pos] * 500::ms => adsr.attackTime;
        decay + automationDecay[clip][pos] * 500::ms => adsr.decayTime;
        pitch + automationPitch[clip][pos] * pitch => sinus.freq;
        cutoff + automationCutoff[clip][pos] * 10000  => lowpass.freq;
        reso + automationReso[clip][pos] * 10 => lowpass.Q;
        reverbMix + automationReverb[clip][pos] => reverbSend.gain;
        echoMix + automationEcho[clip][pos] => echoSend.gain;
        echoTime + automationEchoTime[clip][pos] * 2000::ms => delay.delay;
        feedback + automationFeedback[clip][pos] => feedbackGain.gain;

        if (level > 0) {
            level => gain.gain;
            
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
1::ms       => limiter.attackTime;
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
                
                if (key == "sinus") {
                    value => instrument.automationSinus[clip][pos];
                }
                
                if (key == "noise") {
                    value => instrument.automationNoise[clip][pos];
                }
                
                if (key == "pitch") {
                    value => instrument.automationPitch[clip][pos];
                }
                
                if (key == "cutoff") {
                    value => instrument.automationCutoff[clip][pos];
                }
                
                if (key == "pitch") {
                    value => instrument.automationPitch[clip][pos];
                }
                
                if (key == "attack") {
                    value => instrument.automationAttack[clip][pos];
                }
                
                if (key == "decay") {
                    value => instrument.automationDecay[clip][pos];
                }
                
                if (key == "reverb") {
                    value => instrument.automationReverb[clip][pos];
                }
                
                if (key == "echo") {
                    value => instrument.automationEcho[clip][pos];
                }
                
                if (key == "feedback") {
                    value => instrument.automationFeedback[clip][pos];
                }
                
                if (key == "echo_time") {
                    value => instrument.automationEchoTime[clip][pos];
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
                    value => instrument.noiseLevel;
                }

                if (parameter == "sinus") {
                    value => instrument.sinusLevel;
                }

                if (parameter == "pitch") {
                    value => instrument.pitch;
                }

                if (parameter == "cutoff") {
                    value => instrument.cutoff;
                }

                if (parameter == "reso") {
                    value => instrument.reso;
                }
 
                if (parameter == "attack") {
                    value::ms => instrument.attack;
                }
                
                if (parameter == "decay") {
                    value::ms => instrument.decay;
                }

                if (parameter == "reverb") {
                    value => instrument.reverbMix;
                }

                if (parameter == "echo") {
                    value => instrument.echoMix;
                }

                if (parameter == "feedback") {
                    value => instrument.feedback;
                }

                if (parameter == "echo_time") {
                    value::ms => instrument.echoTime;
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