dac => Gain g => WvOut w => blackhole;

"./stdout" => w.wavFilename;

while( true ) 1::second => now;