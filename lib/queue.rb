class TQueue
  attr_reader :thread

  def initialize(port)
    @host = 'localhost'
    @port = port
    @server = OSC::UDPServer.new
    @server.bind(@host, @port)
    @server.add_method('/*', nil) do |message|
      begin
        puts "#{message.address} #{message.args.inspect}"
        push message
      rescue 
        puts $!.message
        puts $!.backtrace
      end
    end

    Thread.new do
      @server.serve
    end

    @list = []
  end

  def push(message)
    @list << message
    @thread.wakeup if @thread       
  end

  def messages
    if @list.empty?
      @thread = Thread.current
      Thread.stop
      @thread = nil
    end

    result = @list.dup
    @list.clear
    result
  end
end
