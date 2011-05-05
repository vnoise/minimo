
public class Parameter {
    float min;
    float max;
    float value;
    float pattern[16];
    int type;
    
    public float read(int pos) {
        if (type == 0) {
            return Math.max(min, Math.min(max, pattern[pos] * value));
        }
        else {
            return Math.max(min, Math.min(max, value + pattern[pos] * max));
        }
    }

    public void init(float value) {
        for (0 => int i; i < 16; i++) {
            value => pattern[i];
        }
    }
};

