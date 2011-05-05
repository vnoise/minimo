
public class Mode
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
