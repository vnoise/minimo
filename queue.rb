class TQueue
  def initialize
    @list = []
  end

  def push(msg)
    @list << msg
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
