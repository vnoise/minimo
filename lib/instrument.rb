class Instrument  
  attr_reader :index

  def initialize(index)
    @index = index
    @pattern = Array.new(8) { Array.new(16) { 0 } }    
    @sliders = []
    @clip = 0
    @bpm = 120
    @mode = "chromatic"
    @socket = OSC::UDPSocket.new
    @host = 'localhost'
    @port = 10000 + @index    

    add_slider(:sinus     , 0, 0, 1, 0.01)
    add_slider(:saw       , 0, 0, 1, 0.01)
    add_slider(:square    , 0, 0, 1, 0.01)
    add_slider(:noise     , 0, 0, 1, 0.01)
    add_slider(:pitch     , 0, 0, 7, 1)
    add_slider(:lowpass   , 1, 0.1, 1, 0.01)
    add_slider(:hipass    , 0.1, 0.1, 1, 0.01)
    add_slider(:reso      , 1, 1, 5, 0.05)
    add_slider(:attack    , 0, 0, 100, 1)
    add_slider(:decay     , 100, 0, 500, 5)
    add_slider(:reverb    , 0, 0, 0.5, 0.005)
    add_slider(:echo      , 0, 0, 1, 0.01)
    add_slider(:echo_time , 125, 0, 500, 5)
    add_slider(:feedback  , 0.5, 0, 1, 0.01)

    system("chuck + seq.ck")

    sleep 0.1

    @socket.send(OSC::Message.new("/port", "i", @port), 0, @host, 9998)
  end

  def send(message)
    @socket.send(message.osc_message, 0, @host, @port)
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

  def slider(key)
    key = key.to_sym
    @sliders.find {|slider| slider.key == key }
  end

  def parameter(key, value)
    slider(key).set_value(value)
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
    Message.new(self, *args)
  end

  def bpm_message
    message('/bpm', 'f', @bpm.to_f)
  end

  def constructor_message
    message('/instrument', '')
  end

  def clip_message
    message("/clip", 'i', @clip)
  end

  def mode_message
    message("/mode", 's', @mode)
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
    message = __send__(type, *args)
    broadcast([message], sender_id)
  end

  def broadcast(messages, sender_id = nil)
    $osc.broadcast(messages, sender_id)
  end

  def constructor_messages
    messages = []
    messages << constructor_message
    messages << bpm_message
    messages << clip_message
    messages += pattern_messages

    @sliders.each do |slider|
      messages += slider.messages
    end

    messages
  end

end
