require 'message'
require 'slider'
require 'instrument'

class InstrumentManager

  attr_reader :instruments

  def initialize
    @instruments = []
    
    add_instrument(0, {:sinus => 0.8, :pitch => 80 , :noise => 0.0, :cutoff => 400, :reso => 1, :attack => 0.0, :decay => 100}, [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0])
    add_instrument(1, {:sinus => 0.5, :pitch => 160, :noise => 0.5, :cutoff => 2000, :reso => 1, :attack => 0.0, :decay => 100, :echo => 1, :feedback => 0.5, :echo_time => 200}, [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0])
    add_instrument(2, {:sinus => 0.0, :pitch => 320, :noise => 1.0, :cutoff => 10000, :reso => 1, :attack => 0.0, :decay => 100}, [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0])
  end

  def add_instrument(index, options, pattern)
    instrument = Instrument.new(self, index)
    @instruments << instrument

    instrument.set_params(options)
    instrument.set_pattern(0, pattern)
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
