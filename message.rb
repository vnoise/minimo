class Message

  attr_accessor :address, :types, :args

  def initialize(address, types, *args)
    @address, @types, @args = address, types, args
  end

  def to_osc
    OSC::Message.new(@address, @types, *@args)
  end

end
