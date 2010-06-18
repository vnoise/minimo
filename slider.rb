class Slider
  attr_reader :key, :value, :max, :automation

  def initialize(instrument, key, max)
    @instrument = instrument
    @automation = Array.new(8) { Array.new(16) { 0 } }
    @value = 0
    @key = key
    @max = max
  end

  def messages
    messages = []
    messages << constructor_message
    messages << parameter_message

    @automation.each_with_index do |pattern, clip|
      pattern.each_with_index do |value, index|
        messages << automation_message(clip, index, value)
      end
    end

    messages
  end

  def constructor_message
    Message.new("/slider", "isf", @instrument.index, @key, @max)
  end

  def parameter_message
    Message.new("/parameter", "isf", @instrument.index, @key, @value)
  end

  def automation_message(clip, index, value)
    Message.new("/automation", "isiif", @instrument.index, @key, clip, index, value)
  end

  def set_value(value)
    @value = [value.to_f, max].min
    $sender.send(parameter_message)
  end

  def automation(clip, index, value)
    @automation[clip.to_i][index.to_i] = value.to_f
    $sender.send(automation_message(clip, index, value))
  end
  
end
