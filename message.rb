class Message

  attr_accessor :address, :types, :args

  def initialize(address, types, *args)
    @address, @types, @args = address, types, args

    if types and types.size != args.size
      raise "arity mismatch: #{address} #{types} #{args.inspect}"
    end
  end

  def to_osc
    OSC::Message.new(@address, @types, *@args)
  end

  def to_ary
    [@address, @types, @args]
  end

end
