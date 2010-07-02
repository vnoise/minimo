
public class Parameter {
    float min;
    float max;
    float value;
    float pattern[16][16];
    
    public float read(int clip, int pos) {
        return Math.max(min, Math.min(max, value + pattern[clip][pos] * max));
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

