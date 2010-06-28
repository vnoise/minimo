class TQueue
  def initialize
    @list = []
  end

  def push(messages)
    # puts "Thread #{Thread.current.id} is pushing"
    messages.each do |message|
      @list << message
    end
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
