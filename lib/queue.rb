class TQueue
  attr_reader :instrument

  def initialize(instrument)
    @list = []
    @instrument = instrument
  end

  def push(messages)
    messages = [messages] unless Array === messages
    return if messages.first.address == '/clock' 

    # puts "Thread #{Thread.current.object_id} is pushing"

    messages.each do |message|
      @list << message if message.instrument == @instrument
    end
    # p messages

    @thread.wakeup if @thread       
  end

  def wait
    # puts "Thread #{Thread.current.id} is waiting"
    @thread = Thread.current
    Thread.stop
    @thread = nil
    result = @list.dup
    @list.clear
    result
  end
end
