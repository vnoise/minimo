require 'osc'
require 'queue'

class OSCSender

  def initialize(host, port)
    @host = host
    @port = port
    @socket = OSC::UDPSocket.new
  end

  def send(address, types, *args)
    message = OSC::Message.new(address, types, *args)
    puts "#{address} #{types} #{args.inspect}"
    @socket.send(message, 0, @host, @port)
    message
  end
  
  def call(env)
    sender_id, type, index, *args = env['PATH_INFO'].split('/')[1..-1]

    $manager.handle(sender_id, type, index, args)

    [200, {'Content-Type' => 'text/html'}, "OK"]
  end
end
  
