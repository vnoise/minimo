class Instrument  

  attr_reader :index, :pattern, :sliders, :clip

  def initialize(index)
    @index = index
    @pattern = Array.new(8) { Array.new(16) { 0 } }    
    @sliders = []
    @clip = 0

    add_slider(:sinus     , 1, 0, 1, 0.01)
    add_slider(:saw       , 0, 0, 1, 0.01)
    add_slider(:square    , 0, 0, 1, 0.01)
    add_slider(:noise     , 0, 0, 1, 0.01)
    add_slider(:pitch     , 36, 24, 60, 1)
    add_slider(:lowpass   , 1, 0.1, 1, 0.01)
    add_slider(:hipass    , 0.1, 0.1, 1, 0.01)
    add_slider(:reso      , 1, 1, 5, 0.05)
    add_slider(:attack    , 0, 0, 100, 1)
    add_slider(:decay     , 100, 0, 500, 5)
    add_slider(:reverb    , 0, 0, 0.5, 0.005)
    add_slider(:echo      , 0, 0, 1, 0.01)
    add_slider(:echo_time , 125, 0, 500, 5)
    add_slider(:feedback  , 0.5, 0, 1, 0.01)
  end

  def send_updates
    messages = constructor_messages
    $receiver.broadcast(messages)

    messages.each do |message|
      $sender.send(message)
      sleep 0.0001
    end
  end

  def add_slider(*args)
    @sliders << Slider.new(self, *args)
  end

  def slider(key)
    key = key.to_sym
    @sliders.find {|slider| slider.key == key }
  end

  def parameter(key, value)
    slider(key).set_value(value)
  end

  def clip(clip)
    @clip = clip.to_i
    $sender.send(clip_message)
  end

  def pattern(clip, index, value)
    @pattern[clip.to_i][index.to_i] = value.to_f
    $sender.send(pattern_message(clip, index, value))
  end

  def constructor_message
    Message.new('/instrument', 'i', @index)
  end

  def clip_message
    Message.new("/clip", 'ii', @index, @clip)
  end

  def pattern_message(clip, index, value)
    Message.new("/pattern", "iiif", @index, clip, index, value)
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
    message = send(type, *args)
    $receiver.broadcast([message], sender_id)
  end

  def constructor_messages
    messages = []
    messages << constructor_message
    messages << clip_message
    messages += pattern_messages

    @sliders.each do |slider|
      messages += slider.messages
    end

    messages
  end

end
