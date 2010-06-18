require 'osc'
require 'queue'

class OSCSender

  def initialize(host, port)
    @host = host
    @port = port
    @socket = OSC::UDPSocket.new
  end

  def send(*args)
    if Message === args.first  
      message = args.first.to_osc
    else
      message = OSC::Message.new(*args)
    end

    @socket.send(message, 0, @host, @port)
    message
  end
  
  def call(env)
    sender_id, type, index, *args = env['PATH_INFO'].split('/')[1..-1]

    $manager.handle(sender_id, type, index, args)

    [200, {'Content-Type' => 'text/html'}, "OK"]
  end
end
  
