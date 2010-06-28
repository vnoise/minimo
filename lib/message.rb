class Message

  attr_accessor :address, :types, :args, :instrument

  def initialize(instrument, address, types, *args)
    @instrument, @address, @types, @args = instrument, address, types, args

    if types and types.size != args.size
      raise "arity mismatch: #{address} #{types} #{args.inspect}"
    end
  end

  def osc_message
    OSC::Message.new(@address, @types, *@args)
  end

  def json_message
    [@address, [@instrument.index] + @args]
  end

  def inspect
    "<osc #{address} #{types} #{ args.join(' ') }>"
  end

end
