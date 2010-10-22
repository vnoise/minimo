class Instrument  
  attr_reader :index, :port

  def initialize(index)
    @index = index
    @pattern = Array.new(4) { Array.new(16) { 0 } }    
    @sliders = []
    @clip = 0
    @bpm = 120
    @mode = "chromatic"
    @type = "sinus"
    @sample = ""
    @port = 10000 + index

    add_slider(:volume    , 0, 0, 1, 0.01)
    add_slider(:octave    , 0, 0, 6, 1)
    add_slider(:pitch     , 0, 0, 12, 1)
    add_slider(:lowpass   , 1, 0.1, 1, 0.01)
    add_slider(:hipass    , 0.1, 0.1, 1, 0.01)
    add_slider(:reso      , 1, 1, 5, 0.05)
    add_slider(:attack    , 0, 0, 100, 1)
    add_slider(:decay     , 100, 0, 500, 5)
    add_slider(:reverb    , 0, 0, 0.5, 0.005)
    add_slider(:echo      , 0, 0, 1, 0.01)
    add_slider(:echo_time , 4, 0, 8, 1)
    add_slider(:feedback  , 0.5, 0, 1, 0.01)
  end

  def create
    system("chuck + seq.ck")
    sleep 0.1
    $osc.send(OSC::Message.new("/port", "i", port), 9998)
  end

  def send(message)
    $osc.send(message.osc_message, port)
    message
  end

  def send_updates
    messages = constructor_messages
    broadcast(messages)

    messages.each do |message|
      send(message)
      sleep 0.0001
    end
  end

  def add_slider(*args)
    @sliders << Slider.new(self, *args)
  end

  def bpm(value)
    @bpm = value.to_f
    send(bpm_message)
  end

  def mode(value)
    @mode = value
    send(mode_message)
  end

  def type(value)
    @type = value
    send(type_message)
  end

  def sample(value)
    @sample = value
    send(sample_message)
  end

  def slider(key)
    key = key.to_sym
    @sliders.find {|slider| slider.key == key }
  end

  def parameter(key, value)
    slider(key).set_value(value)
    slider(key).parameter_message
  end

  def clip(clip)
    @clip = clip.to_i

    send(clip_message)
  end

  def pattern(clip, index, value)
    @pattern[clip.to_i][index.to_i] = value.to_f
    send(pattern_message(clip, index, value))    
  end

  def message(*args)
    Message.new(@index, *args)
  end

  def bpm_message
    message('/bpm', 'f', @bpm.to_f)
  end

  def constructor_message
    Message.new(nil, '/instrument', 'i', index)
  end

  def draw_message
    Message.new(nil, '/instrument_draw', 'i', index)
  end

  def clip_message
    message("/clip", 'i', @clip)
  end

  def mode_message
    message("/mode", 's', @mode)
  end

  def sample_message
    message("/sample", 's', @sample)
  end

  def type_message
    message("/type", 's', @type)
  end

  def pattern_message(clip, index, value)
    message("/pattern", "iif", clip, index, value)
  end

  def pattern_messages    
    messages = []

    @pattern.each_with_index do |pattern, clip|
      pattern.each_with_index do |value, index|
        messages << pattern_message(clip, index, value) unless value == 0
      end
    end

    messages
  end

  def automation(clip, key, index, value)
    slider(key).automation(clip, index, value)
  end

  def handle(sender_id, type, args)
    if message = __send__(type, *args) 
      broadcast([message], sender_id)
    end
  end

  def broadcast(messages, sender_id = nil)
    $osc.broadcast(messages, sender_id)
  end

  def constructor_messages
    messages = [constructor_message,
                bpm_message,
                clip_message,
                mode_message,
                sample_message,
                type_message]

    messages += pattern_messages

    @sliders.each do |slider|
      messages += slider.messages
    end

    @sliders.each do |slider|
      messages += slider.automation_messages
    end

    messages += [draw_message]

    messages
  end

end
