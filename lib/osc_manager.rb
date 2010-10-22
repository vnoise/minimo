require 'osc'
require 'thread'
require 'json'
require 'queue'

class OSCManager

  def initialize
    @host = 'localhost'
    @port = 9999
    @queues = {}
    @socket = OSC::UDPSocket.new

    @server = OSC::UDPServer.new
    @server.bind(@host, @port)
    # @server.add_method('/*', nil) do |osc|
    #   begin
    #     broadcast Message.new(nil, osc.address, osc.types, *osc.args)
    #   rescue 
    #     puts $!.message
    #     puts $!.backtrace
    #   end
    # end

    Thread.new do
      @server.serve
    end
  end

  def send(message, port)
    @socket.send(message, 0, @host, port)
  end

  def broadcast(messages, sender_id = nil)
    @queues.each do |client_id, queue|
      unless client_id == sender_id
        queue.push(messages)
      end
    end
  end
  
  def call(env)
    client_id, instrument_id, = env['PATH_INFO'].split('/')[1..-1]
    queue = @queues[client_id]
    # queue = pool[instrument_id]
    instrument_id = instrument_id.to_i

    if queue.nil?
      @queues[client_id] = TQueue.new(instrument_id)
      instrument = $manager.instruments[instrument_id]
      messages = instrument.constructor_messages.map { |message| message.json_message }
    else
      messages = queue.wait.map {|message| message.json_message }
    end

    [200, {'Content-Type' => 'text/javascript'}, messages.to_json]
  end
end
  
