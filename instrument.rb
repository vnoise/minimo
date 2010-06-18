class Instrument  

  attr_reader :index, :pattern, :sliders, :clip

  def initialize(manager, index)
    @manager = manager
    @index = index
    @pattern = Array.new(8) { Array.new(16) { 0 } }    
    @sliders = []
    @clip = 0

    add_slider(:sinus, 1)
    add_slider(:pitch, 500)
    add_slider(:noise, 1)
    add_slider(:cutoff, 20000)
    add_slider(:reso, 10)
    add_slider(:attack, 500)
    add_slider(:decay, 500)
    add_slider(:reverb, 1)
    add_slider(:echo, 1)
    add_slider(:echo_time, 1000)
    add_slider(:feedback, 1)
  end

  def set_params(options)
    options.each do |key, value|
      parameter(key, value)
    end
  end

  def set_pattern(clip, list)
    list.each_with_index do |value, index|
      pattern(clip, index, value)
    end
  end

  def add_slider(key, max)
    @sliders << Slider.new(self, key, max)
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
        messages << pattern_message(clip, index, value)
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

  def messages
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
