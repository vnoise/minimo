class Slider
  attr_reader :key, :value, :min, :max, :step, :automation

  def initialize(instrument, key, value, min, max, step)
    @instrument = instrument
    @automation = Array.new(4) { Array.new(16) { 0 } }
    @key = key
    @value = value
    @min = min
    @max = max
    @step = step
  end

  def messages
    [constructor_message, parameter_message]
  end

  def automation_messages
    messages = []
    @automation.each_with_index do |pattern, clip|
      pattern.each_with_index do |value, index|
        messages << automation_message(clip, index, value) unless value == 0
      end
    end
    messages
  end

  def message(*args)
    @instrument.message(*args)
  end

  def constructor_message
    message("/slider", "sfff", @key, @min, @max, @step)
  end

  def parameter_message
    message("/parameter", "sf", @key, @value)
  end

  def automation_message(clip, index, value)
    message("/automation", "siif", @key, clip, index, value)
  end

  def set_value(value)
    @value = value.to_f
    @instrument.send(parameter_message)
  end

  def automation(clip, index, value)
    @automation[clip.to_i][index.to_i] = value.to_f
    @instrument.send(automation_message(clip, index, value))
  end
  
end
