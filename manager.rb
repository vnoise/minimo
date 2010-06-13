
class Slider
  attr_reader :key, :value

  def initialize(instrument, key)
    @instrument = instrument
    @pattern = Array.new(16) { 0 }
    @value = 0
    @key = key
  end

  def set_value(value)
    @value = value.to_f
    $sender.send("/parameter", "isf", @instrument.index, @key, @value)
  end
  
end

class Instrument  

  def initialize(manager)
    @manager = manager
    @pattern = Array.new(16) { 0 }    
    @sliders = {}
    @automation = {}

    add_slider(:volume)
    add_slider(:sinus)
    add_slider(:freq)
    add_slider(:noise)
    add_slider(:attack)
    add_slider(:decay)

    add_automation(:sinus)
    add_automation(:freq)
    add_automation(:noise)
    add_automation(:attack)
    add_automation(:decay)
  end

  def set_params(options)
    options.each do |key, value|
      parameter(key, value)
    end
  end

  def set_pattern(list)
    @pattern = list
    @pattern.each_with_index do |value, index|
      pattern(index, value)
    end
  end

  def add_slider(key)
    @sliders[key] = Slider.new(self, key)
  end

  def add_automation(key)
    @automation[key] = Array.new(16) { 0 }
  end

  def index
    @manager.instruments.index(self)
  end

  def parameter(key, value)
    @sliders[key.to_sym].set_value(value)
  end

  def pattern(index, value)
    @pattern[index.to_i] = value.to_f
    $sender.send("/pattern", "iif", self.index, index, value)
  end

  def automation(key, index, value)
    @automation[key.to_sym][index.to_i] = value.to_f
    $sender.send("/automation", "isif", self.index, key, index, value)
  end
  
  def handle(sender_id, type, args)
    message = send(type, *args)
    $receiver.broadcast([message], sender_id)
  end

  def messages
    index = self.index
    messages = []

    @pattern.each_with_index do |value, i|
      messages << { :address => '/pattern', :args => [index, i, value] }
    end

    @sliders.each_value do |slider|
      messages << { :address => "/parameter", :args => [index, slider.key, slider.value] }
    end    

    messages
  end

end

class InstrumentManager

  attr_reader :instruments

  def initialize
    @instruments = []
    
    add_instrument({:sinus => 0.8, :freq => 80 , :noise => 0.0, :volume => 0.8, :attack => 0.0, :decay => 100},
                   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0])

    add_instrument({:sinus => 0.5, :freq => 160, :noise => 0.5, :volume => 0.8, :attack => 0.0, :decay => 100},
                   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0])

    add_instrument({:sinus => 0.0, :freq => 320, :noise => 1.0, :volume => 0.2, :attack => 0.0, :decay => 100},
                   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0])
  end

  def add_instrument(options, pattern)
    instrument = Instrument.new(self)
    @instruments << instrument

    instrument.set_params(options)
    instrument.set_pattern(pattern)
  end

  def handle(sender_id, type, index, args)
    @instruments[index.to_i].handle(sender_id, type, args)
  end

  def messages
    messages = []

    @instruments.each do |instrument|
      messages += instrument.messages
    end

    messages
  end
end
