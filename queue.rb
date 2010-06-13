class TQueue
  def initialize
    @list = []
  end

  def push(messages)
    messages.each do |message|
      @list << message
    end
    @thread.wakeup if @thread       
  end

  def wait
    @thread = Thread.current
    Thread.stop
    @thread = nil
    result = @list.dup
    @list.clear
    result
  end
end
