require 'osc'
require 'queue'

class Instrument  

  def initialize
    @pattern = Array.new(16) { 0 }

    @volume = Slider.new(this, 'volume', 1)
    @sinus  = Slider.new(this, 'sinus', 1)
    @freq   = Slider.new(this, 'freq', 500)
    @noise  = Slider.new(this, 'noise', 1)
    @attack = Slider.new(this, 'attack', 500)
    @delay  = Slider.new(this, 'decay', 500)
  end

end

class OSCSender

  def initialize(host, port, osc_receiver)
    @host = host
    @port = port
    @socket = OSC::UDPSocket.new
    @osc_receiver = osc_receiver
  end
  
  def call(env)
    client_id, path, types, *args = env['PATH_INFO'].split('/')[1..-1]

    message = OSC::Message.new('/' + path, types, *args)

    @osc_receiver.broadcast(message, client_id)

    @socket.send(message, 0, @host, @port)

    [200, {'Content-Type' => 'text/html'}, "OK"]
  end
end
  
