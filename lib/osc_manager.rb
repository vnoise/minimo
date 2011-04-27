require 'osc'
require 'thread'
require 'json'
require 'queue'

class OSCServer

  def initialize
    @queues = {}

    system "chuck + Parameter.ck"
    system "chuck + Mode.ck"
    system "chuck + Instrument.ck"
  end

  def queue_for(port)
    @queues[port] ||= TQueue.new(port)
  end

  def call(env)
    queue = queue_for(env['PATH_INFO'][1..-1].to_i)

    messages = queue.messages.map {|m| [m.address, m.types, m.args] }

    return [200, {'Content-Type' => 'text/javascript'}, messages.to_json]
  end
  
end


class OSCClient

  def initialize
    @host = 'localhost'
    @socket = OSC::UDPSocket.new

    create_instrument(0)
  end

  def send(message, port)
    @socket.send(message, 0, @host, port)
  end

  def create_instrument(index)
    system "chuck + seq.ck"
    # sleep 0.1
    send OSC::Message.new("/update", ""), 10000
  end

  def call(env)
    port, address, types, *args = env['PATH_INFO'].split('/')[1..-1]

    message = OSC::Message.new('/' + address, types, *args)

    send message, port.to_i

    [200, {'Content-Type' => 'text/html'}, "OK"]
  end

end

