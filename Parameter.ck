
public class Parameter {
    float min;
    float max;
    float value;
    float pattern[16];
    
    public float read(int pos) {
        return Math.max(min, Math.min(max, value + pattern[pos] * max));
    }

    public void init() {
        for (0 => int i; i < 16; i++) {
            0 => pattern[i];
        }
    }
};

